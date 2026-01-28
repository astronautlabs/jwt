import { JWTEngine, EncodeOptions, Token, DecodeOptions } from "../common/interface";
import * as jsonwebtoken from 'jsonwebtoken';
import { validateExpiry, DecodedToken } from "../common";
export * from '../common';

export class NodeJWT implements JWTEngine {
    /**
     * A simple decode used to obtain the header since the jsonwebtoken package does not 
     * expose it. It is not used during the validation or decoding paths for this implementation.
     * @param token 
     * @returns 
     */
    private _decode(token : string): DecodedToken {
        let parts = token.split('.');
        if (parts.length !== 3)
            throw new Error(`Invalid token '${token}': must have 3 parts separated by '.'`);

        return {
            encodedHeader: parts[0],
            encodedPayload: parts[1],
            signature: parts[2],

            header: JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8')),
            payload: JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8')),
        };
    };

    async decodeUntrusted(token: string): Promise<Token> {
        let decoded = this._decode(token);
        return { 
            claims: decoded.payload,
            header: decoded.header,
            string: token
        };
    }

    async encode(claims: Record<string, any>, options: EncodeOptions): Promise<Token> {
        let string = jsonwebtoken.sign(claims, options.secretOrKey, {
            algorithm: <any>options.algorithm
        });

        return {
            string,
            header: this._decode(string).header,
            claims
        }
    }

    async validate(string : string, options: DecodeOptions): Promise<Token> {
        let claims : Record<string,any>;
        
        try {
            claims = <Record<string,any>>jsonwebtoken.verify(string, options.secretOrKey, {
                algorithms: [ <any>options.algorithm ],
                ignoreExpiration: true
            });
        } catch (e) {
            if (e.message === 'invalid signature')      // For uniformity
                throw new Error(`Cannot validate JWT '${string}': Invalid signature`);
            else if (e.message === 'invalid algorithm')
                throw new Error(`Cannot validate JWT '${string}': Token has incorrect algorithm`);
            else if (e.message === 'jwt signature is required')
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
            header: this._decode(string).header,
            claims
        }
    }

}

export function createJWTEngine() : JWTEngine { return new NodeJWT(); };
export const JWT = createJWTEngine();