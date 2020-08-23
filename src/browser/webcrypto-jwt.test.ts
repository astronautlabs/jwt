import { suite } from 'razmin';
import { expect } from 'chai';
import { WebCryptoJWT } from './webcrypto-jwt';
//import * as webcrypto from '@trust/webcrypto';
//global['atob'] = require('atob');
//global['btoa'] = require('btoa');

let SAMPLE_TOKEN_HS256 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
let SAMPLE_TOKEN_HS256_INVALID = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_SNEAKYssw5c`;
let SAMPLE_KEY_HS256 = `your-256-bit-secret`;

let SAMPLE_PUBKEY_RS256 = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv
vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc
aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy
tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0
e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb
V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9
MwIDAQAB
-----END PUBLIC KEY-----`;
let SAMPLE_PRIVATEKEY_RS256 = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfPKKzVmN80HRs
GAoUxK++RO3CW8GxomrtLnAD6TN5U5WlVbCRZ1WFrizfxcz+lr/Kvjtq/v7PdVOa
8NHIAdxpP3bCFEQWku/1yPmVN4lKJvKv8yub9i2MJlVaBo5giHCtfAouo+v/XWKd
awCR8jK28dZPFlgRxcuABcW5S5pLe4X2ASI1DDMZNTW/QWqSpMGvgHydbccI3jtd
S7S3xjR76V/izg7FBrBYPv0n3/l3dHLS9tXcCbUW0YmIm87BGwh9UKEOlhK1NwdM
Iyq29ZtXovXUFaSnMZdJbge/jepr4ZJg4PZBTrwxvn2hKTY4H4G04ukmh+ZsYQaC
+bDIIj0zAgMBAAECggEAKIBGrbCSW2O1yOyQW9nvDUkA5EdsS58Q7US7bvM4iWpu
DIBwCXur7/VuKnhn/HUhURLzj/JNozynSChqYyG+CvL+ZLy82LUE3ZIBkSdv/vFL
Ft+VvvRtf1EcsmoqenkZl7aN7HD7DJeXBoz5tyVQKuH17WW0fsi9StGtCcUl+H6K
zV9Gif0Kj0uLQbCg3THRvKuueBTwCTdjoP0PwaNADgSWb3hJPeLMm/yII4tIMGbO
w+xd9wJRl+ZN9nkNtQMxszFGdKjedB6goYLQuP0WRZx+YtykaVJdM75bDUvsQar4
9Pc21Fp7UVk/CN11DX/hX3TmTJAUtqYADliVKkTbCQKBgQDLU48tBxm3g1CdDM/P
ZIEmpA3Y/m7e9eX7M1Uo/zDh4G/S9a4kkX6GQY2dLFdCtOS8M4hR11Io7MceBKDi
djorTZ5zJPQ8+b9Rm+1GlaucGNwRW0cQk2ltT2ksPmJnQn2xvM9T8vE+a4A/YGzw
mZOfpoVGykWs/tbSzU2aTaOybQKBgQDIfRf6OmirGPh59l+RSuDkZtISF/51mCV/
S1M4DltWDwhjC2Y2T+meIsb/Mjtz4aVNz0EHB8yvn0TMGr94Uwjv4uBdpVSwz+xL
hHL7J4rpInH+i0gxa0N+rGwsPwI8wJG95wLY+Kni5KCuXQw55uX1cqnnsahpRZFZ
EerBXhjqHwKBgBmEjiaHipm2eEqNjhMoOPFBi59dJ0sCL2/cXGa9yEPA6Cfgv49F
V0zAM2azZuwvSbm4+fXTgTMzrDW/PPXPArPmlOk8jQ6OBY3XdOrz48q+b/gZrYyO
A6A9ZCSyW6U7+gxxds/BYLeFxF2v21xC2f0iZ/2faykv/oQMUh34en/tAoGACqVZ
2JexZyR0TUWf3X80YexzyzIq+OOTWicNzDQ29WLm9xtr2gZ0SUlfd72bGpQoyvDu
awkm/UxfwtbIxALkvpg1gcN9s8XWrkviLyPyZF7H3tRWiQlBFEDjnZXa8I7pLkRO
Cmdp3fp17cxTEeAI5feovfzZDH39MdWZuZrdh9ECgYBTEv8S7nK8wrxIC390kroV
52eBwzckQU2mWa0thUtaGQiU1EYPCSDcjkrLXwB72ft0dW57KyWtvrB6rt1ORgOL
eI5hFbwdGQhCHTrAR1vG3SyFPMAm+8JB+sGOD/fvjtZKx//MFNweKFNEF0C/o6Z2
FXj90PlgF8sCQut36ZfuIQ==
-----END PRIVATE KEY-----`;

const SAMPLE_TOKEN_RS256 = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA`;
const SAMPLE_TOKEN_RS256_INVALID = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.fbMk59LQGNup5Jq9_Vq-Df3f1I8YcM_qzgrhl6R33PviVR6jskvlI__B27nZNh3A0CbH5XmCFAFrF41q2C_-EJAz3Wc9ndNBAu9c2EaF8FDDLsVfpVajApO-iQmt2pE_D54QOOw9VRWEBvx-690DMrZVV8R8wWrNgKZ90kQyxGRQKqWDgOAygBoPMxd4goy9_TKDl6D876bE5hlL2AIRP2Gj1EmA2cMaP2T4kGut-XYBmUKRfQUvDYowzsLid6ejhgUzqA7HAk_pC6E9FS79I0f5XLKaOnELOOKOUTHaCexTeYqfvYxSmpvDokFB1jKiEh1dIrkXNLlMFPTJRMWijA`;


let SAMPLE_PUBKEY_RS256_2 = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv
vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc
aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy
tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0
e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb
V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9
MwIDAQAB
-----END PUBLIC KEY-----`;

let SAMPLE_PRIVATEKEY_RS256_2 = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDfj0kY6x9bEcNe
UUtRxPDzQ6rdaVnsC82QPdnwrXqrd6Bu+HmsmcKfwNxTT5m7H2gDQ+clEn7zTJ+u
sLB3moSmiz6mfRE87rTgNSW5Y8l9uvsV2GCEf1+GIBtdw75Cicq1fE8v+4yMu4xk
8NJkY4AyhihOsq7QARB6i1KM5FHOh2aYMZQI+Hx1J9M6fj0GKJbCJh2VkXyqwNb9
3SvfYLPLSSkTmzOpdRxQfI8Ql9pri0zHUerhFzy8wmHhSz52qRJknZKnhKU6HAsX
v7a5lh8C5fXcgad6tpmKJKBpEx00EtLMyqkb0gBzjKUvEbqWjB5659LH6WQZeMuY
g6abbDbnAgMBAAECggEAL3y/OTTQf0bBqio4hpD/4ZyREeEMAdDsBGSvA6nF8eBC
SvAq4Ff0+Hw+ENBKxm3AaVkmI0DPiJzRGolborxGyx2u3Cya2ceW0j1X2w5wQW3T
YeuJbPulbdcqGPu4UWf1kCFsrLORQl+gTdy9xCdClvjaXQUljvd66Zzolxb0rZq9
keRREJ55VZazBhwjtvfwII7chwzNdFzAX5Ft9IPFOaBoi13bCPTzUPeIazbktwIv
FpKA51M12LF+fJpY608ACP5FR6ShnAxPbvpgOcVtxhuBvAdDu2jTvB9yASsNnHjE
VXp1mTBTx+HsO6onIFqkN5fC/3ds+3zyOScu6RkGMQKBgQD7/h/lKRtEWJVML+ag
a+V2WUy6Yel5IgF7DeH8Z78QOLhB1MUr8jXD8skMcTZiSYuF8rRV5FVHAbv+pnwC
NkZclCNQqoOVbhIT8wBV+TE0ay5ZSLqLkhCdmmYaBg6WccfzPmcIRwTgC3QWSyku
jjpRLxEPTEzbnNRuKFaOSbctKQKBgQDjHWiqiSXXEbQdI80cJmoz1o+gLtUKVdK/
GyUak/AX4PLhG4VZHHHt/AArPYr+eEQcN6aCsWU8qRt6H3LyhBjev93CHAKs4snG
+edQ7xK0kqervR4KXweTD+wqUVglvqmstGwkI33CFUZwE7t6bKgmALfgdeJxFCLM
ScV8y0y1jwKBgQDZXjh9IJxYtGD0u00hjHD/ScCZ9ePDjcXhM/SAGa4CfCrU/oim
g+RFBqTOisnytqYYAWf1v2SgP6q+2zWVYuQG7/IWnz+qIqyNcMwVXUNIiDwO4GGq
C3ExwgHY6OikdbmY5XdS+JAIA1k78dGwSxea+BKrM5IIzpuf+kPPsV7FIQKBgAOW
NE/1KIbT/b80EIowRR8adVw3QSAPqOtht11LFtCZudw6PgnhPB9hCnOkXiyUo6a6
bkPEH3Asz4VHN96CnY3vA8aMALLQRhWBXtjVXbtCUamRrAbH52u4JaepbzXxY+aZ
VtffQ54sDde5SA2v55vqCP1ffzr/8Wi+hYLqBwUbAoGBAIhtiyG3DVX0j0z1EICq
ZR2HJJk7KKPcrUGW0fbNqnxIrjqBq22PGD6rkFHQFpD/y/u7NGpOFU12tk099ly+
EZFf9T6VsMw+7sUFo88gTDL9BK6IBcsYDr5I7QfN5WkXbsrx/s9Yll7urISU3z7o
eUhPf0cYfvNPR4eQb5FLLrDX
-----END PRIVATE KEY-----`;

suite(describe => {
    describe('WebCryptoJWT', it => {
        let engine = new WebCryptoJWT();
        
        describe(': Algorithm=none', it => {
            it('can verify a token', async () => {
                let token = await engine.validate(SAMPLE_TOKEN_HS256, { algorithm: 'none' });
                expect(token.claims.sub).to.eql("1234567890");
                expect(token.claims.iat).to.eql(1516239022);
            });
            it('cannot detect forgery on a token', async () => {
                let token = await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'none' });
                expect(token.claims.sub).to.eql("1234567890");
                expect(token.claims.iat).to.eql(1516239022);
            });
            it('can sign a token', async () => {
                let token = await engine.encode({
                    foo: '123'
                }, {
                    algorithm: 'none'
                });

                expect(token.string).to.eql('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJmb28iOiIxMjMifQ.');
            });
        });
        describe(': Algorithm=HS256', it => {
            it('can verify a token', async () => {
                let token = await engine.validate(SAMPLE_TOKEN_HS256, { algorithm: 'HS256', secretOrKey: SAMPLE_KEY_HS256 });
                expect(token.claims.sub).to.eql("1234567890");
                expect(token.claims.iat).to.eql(1516239022);
            });
            it('can detect a forged token', async () => {
                try {
                    await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'HS256', secretOrKey: SAMPLE_KEY_HS256 });
                } catch (e) {
                    return;
                }

                throw new Error('Engine should have detected forgery');
            });
            it('fails to verify a token with wrong key', async () => {
                try {
                    await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'HS256', secretOrKey: 'wrong-key' });
                } catch (e) {
                    return;
                }

                throw new Error('Engine should have failed to verify');
            });
            it('can sign a token', async () => {
                let token = await engine.encode({
                    foo: 123
                }, {
                    algorithm: 'HS256',
                    secretOrKey: SAMPLE_KEY_HS256
                });

                expect(token.string).to.eql('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOjEyM30.4d4qMPosQn2C8AxOrOJivbSgnwh7TZyLBZYJrHiEpvU');
            });
        });

        describe(': Algorithm=RS256', it => {
            it('can verify a token', async () => {
                let token = await engine.validate(
                    SAMPLE_TOKEN_RS256, 
                    { 
                        algorithm: 'RS256', 
                        secretOrKey: SAMPLE_PUBKEY_RS256 
                    }
                );
                expect(token.claims.sub).to.eql("1234567890");
                expect(token.claims.iat).to.eql(1516239022);
            });
            it('can detect a forged token', async () => {
                try {
                    await engine.validate(SAMPLE_TOKEN_RS256_INVALID, { algorithm: 'RS256', secretOrKey: SAMPLE_PUBKEY_RS256 });
                } catch (e) {
                    return;
                }

                throw new Error('Engine should have detected forgery');
            });
            it('fails to verify a token with wrong key', async () => {
                try {
                    await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'RS256', secretOrKey: SAMPLE_PUBKEY_RS256_2 });
                } catch (e) {
                    return;
                }

                throw new Error('Engine should have failed to verify');
            });
            it('can sign a token', async () => {
                let token = await engine.encode({
                    foo: 123
                }, {
                    algorithm: 'RS256',
                    secretOrKey: SAMPLE_PRIVATEKEY_RS256
                });

                expect(token.string).to.eql('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOjEyM30.QWIrOTaDHjrRkVn4SZ_vZx0lbYmaakExKProS0vOvLVJ-ItUs6N_M9mX3jaITVYbfUnUWvPRm5Q9QN4jM__uQYjrIsJOeLzdTGqugnDph8g8WroLOITLjDLdSzFdkfRwYCChWzvaYYWYmGGYApfVJ-NKQxyrrofdbwzhYY_MWzCeJE3VZp7T7d7DmEmuTxvsIDA1sTxyQt-A-9lndwugA1Fk2fElHcS1ynm07oO2zKO4VtHu3ejN2A48uD2nzFcxqG7Cigygw2c7TVgNw8JM3F-dYn96h6uMMh0Ug42kLVGIF9E1KJGX93-cEUPk-P3QkDPg3Rt7eGj0tru8-ad_sA');
            });
        });
    });
});