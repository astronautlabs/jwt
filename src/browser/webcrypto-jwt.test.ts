import { suite } from 'razmin';
import { expect } from 'chai';
import { WebCryptoJWT } from './webcrypto-jwt';
import * as webcrypto from '@trust/webcrypto';

global['atob'] = require('atob');
global['btoa'] = require('btoa');

let SAMPLE_TOKEN_HS256 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
let SAMPLE_TOKEN_HS256_INVALID = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_SNEAKYssw5c`;
let SAMPLE_KEY_HS256 = `your-256-bit-secret`;

suite(describe => {
    describe('WebCryptoJWT', it => {
        let engine = new WebCryptoJWT(webcrypto.subtle);
        
        it('can verify a token using None algorithm', async () => {
            let token = await engine.validate(SAMPLE_TOKEN_HS256, { algorithm: 'None' });
            expect(token.claims.sub).to.eql("1234567890");
            expect(token.claims.iat).to.eql(1516239022);
        });
        it('cannot detect forgery on a token using None algorithm', async () => {
            let token = await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'None' });
            expect(token.claims.sub).to.eql("1234567890");
            expect(token.claims.iat).to.eql(1516239022);
        });
        it('can verify a token using HS256 algorithm', async () => {
            let token = await engine.validate(SAMPLE_TOKEN_HS256, { algorithm: 'HS256', secretOrKey: SAMPLE_KEY_HS256 });
            expect(token.claims.sub).to.eql("1234567890");
            expect(token.claims.iat).to.eql(1516239022);
        });
        it('can detect a forged token using HS256 algorithm', async () => {
            try {
                await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'HS256', secretOrKey: SAMPLE_KEY_HS256 });
            } catch (e) {
                return;
            }

            throw new Error('Engine should have detected forgery');
        });
        it('fails to verify a token using the wrong key', async () => {
            try {
                await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'HS256', secretOrKey: 'wrong-key' });
            } catch (e) {
                return;
            }

            throw new Error('Engine should have failed to verify');
        });
    });
});