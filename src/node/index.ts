import { JWT, EncodeOptions, Token, DecodeOptions } from "../common/interface";
import * as jsonwebtoken from 'jsonwebtoken';
export * from '../common';

export class NodeJWT implements JWT {
    async encode(claims: Record<string, any>, options: EncodeOptions): Promise<Token> {
        let string = jsonwebtoken.sign(claims, options.secretOrKey, {
            // TODO
        });

        return {
            string,
            claims
        }
    }

    async validate(string : string, options: DecodeOptions): Promise<Token> {
        let claims = <Record<string,any>>jsonwebtoken.verify(string, options.secretOrKey, {
            // TODO
        });
        
        return {
            string,
            claims
        }
    }

}

export function createJWTEngine() : JWT { return new NodeJWT(); };