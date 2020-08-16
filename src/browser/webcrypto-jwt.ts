// Originally from https://github.com/pose/webcrypto-jwt
// (C) Copyright (c) 2015 Alberto Pose albertopose@gmail.com
// Used under the terms of the MIT License (https://github.com/pose/webcrypto-jwt/blob/master/LICENSE.md)

import { JWT, EncodeOptions, Token, DecodeOptions, Options, DecodedToken } from "../common/interface";
import { Base64URL } from "./base64url";
import { Utils } from "./utils";

export class WebCryptoJWT implements JWT {
    constructor(
        private subtleCrypto? : SubtleCrypto
    ) {
        if (!subtleCrypto)
            this.findSubtleCrypto();
    }

    private findSubtleCrypto() {
        if ('crypto' in window)
            this.subtleCrypto = crypto.subtle || crypto['webkitSubtle'];
        if (!this.subtleCrypto && 'msCrypto' in window)
            this.subtleCrypto = window['msCrypto'].Subtle;
        if (!this.subtleCrypto)
            throw new Error(`Not supported: No Subtle Crypto support`);
    }


    async encode(payload: Record<string, any>, options: EncodeOptions): Promise<Token> {
        return {
            string: await this._sign(payload, options.secretOrKey, this.algorithmOf(options)),
            claims: payload
        }
    }

    async validate(string: string, options: DecodeOptions): Promise<Token> {
        let decodedToken = this._decode(string);
        let algorithm = this.algorithmOf(options);
        let secretOrKey = options.secretOrKey;

        if (algorithm !== 'None' && !(await this._verify(decodedToken, secretOrKey, algorithm)))
            throw new Error(`Cannot validate JWT '${string}': Invalid signature`);

        return {
            string,
            claims: decodedToken.payload
        };
    }

    private algorithmOf(options : Options) {
        return options.algorithm || 'HS256';
    }

    /**
     * Adapted from https://chromium.googlesource.com/chromium/blink/+/master/LayoutTests/crypto/subtle/hmac/sign-verify.html
     * 
     * @param token 
     * @param secret 
     * @param alg 
     */
    private async _verify(token : DecodedToken, secret : string, alg : string): Promise<boolean> {
        if (alg === 'None')
            return true;
        
        let algorithms = {
            HS256: {
                name: 'HMAC',
                hash: {
                    name: 'SHA-256'
                }
            }
        };

        let importAlgorithm = algorithms[alg];
        if (!importAlgorithm)
            throw new Error(`Algorithm ${alg} is not supported`);

        // TODO Test utf8ToUint8Array function
        let keyData = Utils.utf8ToUint8Array(secret);

        let key = await this.subtleCrypto.importKey(
            'raw',
            keyData,
            importAlgorithm,
            false,
            ['sign']
        );

        let partialToken = `${token.encodedHeader}.${token.encodedPayload}`;
        let signaturePart = token.signature;

        // TODO Test utf8ToUint8Array function
        let messageAsUint8Array = Utils.utf8ToUint8Array(partialToken);
        // TODO Test utf8ToUint8Array function
        let signatureAsUint8Array = Utils.utf8ToUint8Array(signaturePart);
        
        let result = await this.subtleCrypto.sign(
            importAlgorithm.name,
            key,
            messageAsUint8Array
        );

        // TODO Test
        let resBase64 = Base64URL.stringify(new Uint8Array(result));

        // TODO Time comparison
        return resBase64 === signaturePart;
    };

    private async _sign(payload : Record<string,any>, secret : string, alg : string): Promise<string> {
        let algorithms = {
            HS256: {
                name: 'HMAC',
                hash: {
                    name: 'SHA-256'
                }
            }
        };

        let importAlgorithm = algorithms[alg];

        if (!importAlgorithm)
            throw new Error('algorithm not found');

        let payloadAsJSON = JSON.stringify(payload);
        let header = { alg: alg, typ: 'JWT' };
        let headerAsJSON = JSON.stringify(header);
        let partialToken = Base64URL.stringify(Utils.utf8ToUint8Array(headerAsJSON)) + '.' +
            Base64URL.stringify(Utils.utf8ToUint8Array(payloadAsJSON));

        // TODO Test utf8ToUint8Array function
        let keyData = Utils.utf8ToUint8Array(secret);

        let key = await this.subtleCrypto.importKey(
            'raw',
            keyData,
            importAlgorithm,
            false,
            ['sign']
        )
        let characters = payloadAsJSON.split('');
        let it = Utils.utf8ToUint8Array(payloadAsJSON).entries();
        let i = 0;
        let result = [];
        let current;

        while (!(current = it.next()).done) {
            result.push([current.value[1], characters[i]]);
            i++;
        }

        // TODO Test utf8ToUint8Array function
        let messageAsUint8Array = Utils.utf8ToUint8Array(partialToken);

        let signature = await this.subtleCrypto.sign(
            importAlgorithm.name,
            key,
            messageAsUint8Array
        );

        // TODO Test
        let signatureAsBase64 = Base64URL.stringify(new Uint8Array(signature));
        let token = partialToken + '.' + signatureAsBase64;

        return token;
    };

    private _decode(token : string): DecodedToken {
        let parts = token.split('.');
        if (parts.length !== 3)
            throw new Error(`Invalid token '${token}': must have 3 parts separated by '.'`);

        return {
            encodedHeader: parts[0],
            encodedPayload: parts[1],
            signature: parts[2],

            header: JSON.parse(this._decodeBase64URL(parts[0])),
            payload:  JSON.parse(this._decodeBase64URL(parts[1])),
        };
    };

    private _decodeBase64URL(string : string) {
        string = string.replace(/-/g, '+').replace(/_/g, '/');

        switch (string.length % 4) {
            case 0:
                break;
            case 2:
                string += '==';
                break;
            case 3:
                string += '=';
                break;
            default:
                throw new Error(`Illegal Base64URL string '${string}'`);
        }

        // TODO Use shim or document incompatible browsers
        return decodeURIComponent(escape(atob(string)));
    }
}