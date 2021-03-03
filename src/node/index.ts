import { JWTEngine, EncodeOptions, Token, DecodeOptions } from "../common/interface";
import * as jsonwebtoken from 'jsonwebtoken';
import { Base64URL } from "../browser/base64url";
import { validateExpiry } from "../common";
export * from '../common';

export class NodeJWT implements JWTEngine {
    async decodeUntrusted(token: string): Promise<Token> {
        let decodedToken = <Record<string,any>>jsonwebtoken.decode(token);
        return { claims: decodedToken, string: token };
    }

    async encode(claims: Record<string, any>, options: EncodeOptions): Promise<Token> {
        let string = jsonwebtoken.sign(claims, options.secretOrKey, {
            algorithm: <any>options.algorithm
        });

        return {
            string,
            claims
        }
    }

    async validate(string : string, options: DecodeOptions): Promise<Token> {
        let claims : Record<string,any>;
        
        try {
            claims = <Record<string,any>>jsonwebtoken.verify(string, options.secretOrKey, {
                algorithms: [ <any>options.algorithm ]
            });
        } catch (e) {
            if (e.message === 'invalid signature')      // For uniformity
                throw new Error(`Cannot validate JWT '${string}': Invalid signature`);
            else if (e.message === 'invalid algorithm')
                throw new Error(`Cannot validate JWT '${string}': Token has incorrect algorithm`);

            throw e;
        }

        try {
            validateExpiry(claims.exp, options.now, options.validate?.exp);
        } catch (e) {
            throw new Error(`Cannot validate JWT '${string}': ${e.message}`);
        }

        return {
            string,
            claims
        }
    }

}

export function createJWTEngine() : JWTEngine { return new NodeJWT(); };
export const JWT = createJWTEngine();