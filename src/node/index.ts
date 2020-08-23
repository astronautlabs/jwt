import { JWTEngine, EncodeOptions, Token, DecodeOptions } from "../common/interface";
import * as jsonwebtoken from 'jsonwebtoken';
import { Base64URL } from "../browser/base64url";
export * from '../common';

export class NodeJWT implements JWTEngine {
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
                throw new Error(`Invalid signature`);

            throw e;
        }

        return {
            string,
            claims
        }
    }

}

export function createJWTEngine() : JWTEngine { return new NodeJWT(); };
export const JWT = createJWTEngine();