import { suite } from 'razmin';
import { expect } from 'chai';
import { JWTEngine } from './common';
import * as RS256Fixtures from './fixtures/rs256.fixture';
import * as ES256Fixtures from './fixtures/es256.fixture';

export function engineTest(subjectName : string, engine : JWTEngine) {
    suite(describe => {
        describe(subjectName, it => {
            describe(': Algorithm=HS256', it => {
                let SAMPLE_TOKEN_HS256 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
                let SAMPLE_TOKEN_HS256_INVALID = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_SNEAKYssw5c`;
                let SAMPLE_KEY_HS256 = `your-256-bit-secret`;
                
                it('can verify a token', async () => {
                    let token = await engine.validate(SAMPLE_TOKEN_HS256, { algorithm: 'HS256', secretOrKey: SAMPLE_KEY_HS256 });
                    expect(token.claims.sub).to.equal("1234567890");
                    expect(token.claims.iat).to.equal(1516239022);
                });
                it('can detect a forged token', async () => {
                    try {
                        await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'HS256', secretOrKey: SAMPLE_KEY_HS256 });
                    } catch (e) {
                        expect(e.message).to.contain('Invalid signature');
                        return;
                    }

                    throw new Error('Engine should have detected forgery');
                });
                it('fails to verify a token with wrong key', async () => {
                    try {
                        await engine.validate(SAMPLE_TOKEN_HS256_INVALID, { algorithm: 'HS256', secretOrKey: 'wrong-key' });
                    } catch (e) {
                        expect(e.message).to.contain('Invalid signature');
                        return;
                    }

                    throw new Error('Engine should have failed to verify');
                });
                it('can sign a token', async () => {
                    let token = await engine.encode({
                        foo: 123,
                        iat: 1598181440
                    }, {
                        algorithm: 'HS256',
                        secretOrKey: SAMPLE_KEY_HS256
                    });

                    expect(token.string).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOjEyMywiaWF0IjoxNTk4MTgxNDQwfQ.OCTm-w6hW7tIlVmTPNmj1oqccA5DHkJPX-6gA1-EBJQ');
                });
            });

            describe(': Algorithm=RS256', it => {
                it('can verify a token', async () => {
                    let token = await engine.validate(
                        RS256Fixtures.SAMPLE_TOKEN_RS256, 
                        { 
                            algorithm: 'RS256', 
                            secretOrKey: RS256Fixtures.SAMPLE_PUBKEY_RS256 
                        }
                    );
                    expect(token.claims.sub).to.equal("1234567890");
                    expect(token.claims.iat).to.equal(1516239022);
                });
                it('can detect a forged token', async () => {
                    try {
                        await engine.validate(RS256Fixtures.SAMPLE_TOKEN_RS256_INVALID, { algorithm: 'RS256', secretOrKey: RS256Fixtures.SAMPLE_PUBKEY_RS256 });
                    } catch (e) {
                        expect(e.message).to.contain('Invalid signature');
                        return;
                    }

                    throw new Error('Engine should have detected forgery');
                });
                it('fails to verify a token with wrong key', async () => {
                    try {
                        await engine.validate(RS256Fixtures.SAMPLE_TOKEN_RS256_INVALID, { algorithm: 'RS256', secretOrKey: RS256Fixtures.SAMPLE_PUBKEY_RS256_2 });
                    } catch (e) {
                        expect(e.message).to.contain('Invalid signature');
                        return;
                    }

                    throw new Error('Engine should have failed to verify');
                });
                it('can sign a token', async () => {
                    let token = await engine.encode({
                        foo: 123,
                        iat: 1598181440
                    }, {
                        algorithm: 'RS256',
                        secretOrKey: RS256Fixtures.SAMPLE_PRIVATEKEY_RS256
                    });

                    expect(token.string).to.equal('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOjEyMywiaWF0IjoxNTk4MTgxNDQwfQ.dxtIlvdoi5UqDiqOOJa7zgMbE3u3_uscCXUO3mk3xW1qg-B6rH41hLi22ITxV6CLQhqNlG8HAMI4s3FIkuSpVNo7ghyL0razENh-hgYQLD7CslwDG17f7BWRFF6SI5wuN-MSE4c7ul9GBjHYQxOmJzFQ97WUvCShxcC3511tJYOGaMM-lf6FVTWrM8LQr1BtDgKN37AceGtbsV2LpemR-a3Nj7F5VZiEP9s7zqEGnGEKfm1SJqEvXr7IbvVIpfdCrWjVRJ_dFKfPZ9RLoHpvLXd-HxyxiuYp1-A9q6Tzwv9xYrWtSrCVKNdL4RPXGk8t6RCnLgM01iHHprSw8XS17Q');
                });
            });
        });
        
        describe(': Algorithm=ES256', it => {
            it('can verify a token', async () => {
                let token = await engine.validate(
                    ES256Fixtures.SAMPLE_TOKEN_ES256, 
                    { 
                        algorithm: 'ES256', 
                        secretOrKey: ES256Fixtures.SAMPLE_PUBKEY_ES256 
                    }
                );
                expect(token.claims.sub).to.equal("1234567890");
                expect(token.claims.iat).to.equal(1516239022);
            });
            it('can detect a forged token', async () => {
                try {
                    await engine.validate(ES256Fixtures.SAMPLE_TOKEN_ES256_INVALID, { algorithm: 'ES256', secretOrKey: ES256Fixtures.SAMPLE_PUBKEY_ES256 });
                } catch (e) {
                    expect(e.message).to.contain('Invalid signature');
                    return;
                }

                throw new Error('Engine should have detected forgery');
            });
            it('fails to verify a token with wrong key', async () => {
                try {
                    await engine.validate(ES256Fixtures.SAMPLE_TOKEN_ES256_INVALID, { algorithm: 'ES256', secretOrKey: ES256Fixtures.SAMPLE_PUBKEY_ES256_2 });
                } catch (e) {
                    expect(e.message).to.contain('Invalid signature');
                    return;
                }

                throw new Error('Engine should have failed to verify');
            });
            it('can sign a token', async () => {
                let token = await engine.encode({
                    foo: 123,
                    iat: 1598181440
                }, {
                    algorithm: 'ES256',
                    secretOrKey: ES256Fixtures.SAMPLE_PRIVATEKEY_ES256
                });

                expect(token.string).to.equal('eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOjEyMywiaWF0IjoxNTk4MTgxNDQwfQ.vEfmbIxzeDgW-EPKE6-yJuPNuA2r_4cekk3E77v2JtzXPUyJZvdkV_Pu-_206SljrXEivRm0qZhKErhRynyVXA');
            });
        });
    });
}