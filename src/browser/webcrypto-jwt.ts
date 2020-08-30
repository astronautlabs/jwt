// Originally from https://github.com/pose/webcrypto-jwt
// (C) Copyright (c) 2015 Alberto Pose albertopose@gmail.com
// Used under the terms of the MIT License (https://github.com/pose/webcrypto-jwt/blob/master/LICENSE.md)

import { JWTEngine, EncodeOptions, Token, DecodeOptions, Options, DecodedToken } from "../common/interface";
import { Base64URL } from "./base64url";
import { Utils } from "./utils";
import { validateExpiry } from "../common";

const ALGORITHMS = {
    none: {},
    HS256: {
        importKey: { 
            name: 'HMAC',
            hash: 'SHA-256'
        },
        operation: {
            name: 'HMAC',
            hash: 'SHA-256'
        }
    },
    HS384: {
        importKey: { 
            name: 'HMAC',
            hash: 'SHA-384'
        },
        operation: {
            name: 'HMAC',
            hash: 'SHA-384'
        }
    },
    HS512: {
        importKey: { 
            name: 'HMAC',
            hash: 'SHA-512'
        },
        operation: {
            name: 'HMAC',
            hash: 'SHA-512'
        }
    },
    RS256: {
        importKey: {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        },
        operation: {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        }
    },
    ES256: {
        importKey: {
            name: 'ECDSA',
            namedCurve: 'P-256'
        },
        operation: {
            name: 'ECDSA',
            namedCurve: 'P-256',
            hash: 'SHA-256'
        }
    }
};

export class WebCryptoJWT implements JWTEngine {
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
        let claims = decodedToken.payload;

        // Signature must match

        if (decodedToken.header.alg !== algorithm)
            throw new Error(`Cannot validate JWT '${string}': Token has incorrect algorithm`);

        if (algorithm !== 'none' && !(await this._verify(decodedToken, secretOrKey, algorithm)))
            throw new Error(`Cannot validate JWT '${string}': Invalid signature`);

        // Algorithm must match

        // Expiration

        try {
            validateExpiry(claims.exp, options.now, options.validate?.exp);
        } catch (e) {
            throw new Error(`Cannot validate JWT '${string}': ${e.message}`);
        }
    
        return {
            string,
            claims: decodedToken.payload
        };
    }

    private algorithmOf(options : Options) {
        return options.algorithm || 'HS256';
    }

    private str2ab(str : string) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    /**
     * Adapted from https://chromium.googlesource.com/chromium/blink/+/master/LayoutTests/crypto/subtle/hmac/sign-verify.html
     * 
     * @param token 
     * @param secret 
     * @param alg 
     */
    private async _verify(token : DecodedToken, secret : string, alg : string): Promise<boolean> {
        if (alg === 'none')
            return true;
        
        let importAlgorithm = ALGORITHMS[alg];
        if (!importAlgorithm)
            throw new Error(`Algorithm ${alg} is not supported`);

        let keyFormat : string;
        let secretBuf : ArrayBuffer;
        let encoder = new TextEncoder();

        // TODO Test utf8ToUint8Array function
        if (secret.includes('-----BEGIN PUBLIC KEY-----')) {
            secretBuf = this.str2ab(atob(
                secret
                    .replace(/^-----BEGIN PUBLIC KEY-----\n/, '')
                    .replace(/\n-----END PUBLIC KEY-----/, '')
                    .replace(/\n/g, '')
            ));
            keyFormat = 'spki';
        } else if (secret.includes('-----BEGIN RSA PUBLIC KEY-----')) {
            throw new Error(
                `PKCS#1 keys are not supported. ` 
                + `Please convert the key to PKCS#8 instead: ` 
                + `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in pkcs1.key -out pkcs8.key`
            );
        } else {
            secretBuf = encoder.encode(secret);
            keyFormat = 'raw';
        }

        let key : CryptoKey;
        
        try {
            key = await this.subtleCrypto.importKey(
                keyFormat,
                secretBuf,
                importAlgorithm.importKey,
                false,
                ['verify']
            );
        } catch (e) {
            let identifier = `jwtUncaughtError${Math.floor(10000 + Math.random() * 10000)}`;

            console.error(`JWT.verify(): Caught error while importing ${alg} key: format=${keyFormat}, importAlgorithm: ${JSON.stringify(importAlgorithm.importKey)}.`);
            console.error(e);

            if (typeof window !== 'undefined') {
                window[identifier] = e; 
                console.error(`To aid in debugging, this error was saved to ${identifier}`);
            }

            throw e;
        }

        let partialToken = `${token.encodedHeader}.${token.encodedPayload}`;
        let signaturePart = token.signature;

        // TODO Test utf8ToUint8Array function
        let messageAsUint8Array = encoder.encode(partialToken);
        // TODO Test utf8ToUint8Array function
        let signatureAsUint8Array = Base64URL.parse(signaturePart);
        
        try {
            return await this.subtleCrypto.verify(
                importAlgorithm.operation,
                key,
                signatureAsUint8Array,
                messageAsUint8Array
            );
        } catch (e) {
            console.error(`JWT.verify(): Caught error while verifying token:`);
            console.error(e);
            throw e;
        }
    };

    private async _sign(payload : Record<string,any>, secret : string, alg : string): Promise<string> {
        let importAlgorithm = ALGORITHMS[alg];
        if (!importAlgorithm)
            throw new Error(`Algorithm '${alg}' is not supported`);

        let payloadAsJSON = JSON.stringify(payload);
        let header = { alg: alg, typ: 'JWT' };
        let headerAsJSON = JSON.stringify(header);
        let partialToken = Base64URL.stringify(Utils.utf8ToUint8Array(headerAsJSON)) + '.' +
            Base64URL.stringify(Utils.utf8ToUint8Array(payloadAsJSON));

        if (alg === 'none')
            return `${partialToken}.`;

        let keyFormat = 'raw';
        let encoder = new TextEncoder();
        let secretBuf : ArrayBuffer;

        // TODO Test utf8ToUint8Array function
        if (secret.includes('-----BEGIN RSA PRIVATE KEY-----')) {
            throw new Error(`PKCS#1 keys are not supported. Please convert the key to PKCS#8 instead: openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in pkcs1.key -out pkcs8.key`);
        } else if (secret.includes('-----BEGIN PRIVATE KEY-----')) {
            secretBuf = this.str2ab(atob(
                secret
                    .replace(/^-----BEGIN PRIVATE KEY-----\n/, '')
                    .replace(/\n-----END PRIVATE KEY-----/, '')
                    .replace(/\n/g, '')
            ));
            keyFormat = 'pkcs8';
        } else {
            secretBuf = encoder.encode(secret);
        }

        let key : CryptoKey;
        
        try {
            key = await this.subtleCrypto.importKey(
                keyFormat,
                secretBuf,
                importAlgorithm.importKey,
                false,
                ['sign']
            )
        } catch (e) {
            console.error(`JWT.sign(): Caught error while importing ${alg} key: format=${keyFormat}, importAlgorithm: ${JSON.stringify(importAlgorithm.importKey)}`);
            console.error(e);
            throw e;
        }

        let messageAsUint8Array = Utils.utf8ToUint8Array(partialToken);

        let signature : ArrayBuffer;
        
        try {
            signature = await this.subtleCrypto.sign(
                importAlgorithm.operation,
                key,
                messageAsUint8Array
            );
        } catch (e) {
            console.error(`JWT.sign(): Caught error while signing token:`);
            console.error(e);
            throw e;
        }

        // TODO Test
        let signatureAsBase64 = Base64URL.stringify(new Uint8Array(signature));
        let token = `${partialToken}.${signatureAsBase64}`;

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