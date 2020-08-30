import { suite } from 'razmin';
import { expect } from 'chai';
import { JWTEngine, DecodeOptions } from './common';
import * as RS256Fixtures from './fixtures/rs256.fixture';
import * as RS512Fixtures from './fixtures/rs512.fixture';
import * as ES256Fixtures from './fixtures/es256.fixture';
import * as HS256Fixtures from './fixtures/hs256.fixture';
import * as HS384Fixtures from './fixtures/hs384.fixture';
import * as HS512Fixtures from './fixtures/hs512.fixture';

export interface AlgorithmFixtures {
    SAMPLE_PUBKEY : string;
    SAMPLE_PRIVATEKEY : string;
    SAMPLE_TOKEN : string;
    SAMPLE_TOKEN_INVALID : string;
    SAMPLE_PUBKEY_2 : string;
    SAMPLE_PRIVATEKEY_2 : string;
}

const ALGORITHMS = {
    HS256: HS256Fixtures,
    HS384: HS384Fixtures,
    HS512: HS512Fixtures,
    RS256: RS256Fixtures,
    RS512: RS512Fixtures,
    ES256: ES256Fixtures,    
};

export function engineTest(subjectName : string, engine : JWTEngine) {
    suite(describe => {
        describe(subjectName, it => {
            describe(': Validation', it => {
                describe(': alg', it => {
                    it('rejects tokens with the wrong algorithm', async () => {
                        try {
                            await engine.validate(HS256Fixtures.SAMPLE_TOKEN, { algorithm: 'RS256', secretOrKey: RS256Fixtures.SAMPLE_PUBKEY })
                        } catch (e) {
                            expect(e.message).to.contain('Token has incorrect algorithm');
                            return;
                        }

                        throw new Error(`Should not accept token with incorrect algorithm`);
                    });
                });

                describe(': exp', it => {
                    it('rejects expired tokens by default', async () => {
                        let options = { algorithm: 'HS256', secretOrKey: HS256Fixtures.SAMPLE_PUBKEY };
                        let token = await engine.encode({ exp: Date.now() - 1000 }, options);

                        try {
                            await engine.validate(token.string, options)
                        } catch (e) {
                            expect(e.message).to.contain('Token is expired');
                            return;
                        }

                        throw new Error(`Should not accept an expired token by default`);
                    });

                    it('rejects expired tokens with validate.exp=force', async () => {
                        let options : DecodeOptions = { algorithm: 'HS256', secretOrKey: HS256Fixtures.SAMPLE_PUBKEY, validate: { exp: 'force' } };
                        let token = await engine.encode({ exp: Date.now() - 1000 }, options);

                        try {
                            await engine.validate(token.string, options)
                        } catch (e) {
                            expect(e.message).to.contain('Token is expired');
                            return;
                        }

                        throw new Error(`Should not accept an expired token with validate.exp=force`);
                    });

                    it('accepts fresh tokens with validate.exp=force', async () => {
                        let options : DecodeOptions = { algorithm: 'HS256', secretOrKey: HS256Fixtures.SAMPLE_PUBKEY, validate: { exp: 'force' } };
                        let token = await engine.encode({ sub: 'abcdef', exp: Date.now() + 10000 }, options);

                        let validatedToken = await engine.validate(token.string, options)
                        expect(validatedToken.claims.sub).to.equal('abcdef');
                    });

                    it('rejects tokens without exp claim when configured to do so', async () => {
                        let options : DecodeOptions = { algorithm: 'HS256', secretOrKey: HS256Fixtures.SAMPLE_PUBKEY, validate: { exp: 'force' } };
                        let token = await engine.encode({ sub: 'abcdef' }, options);

                        try {
                            await engine.validate(token.string, options)
                        } catch (e) {
                            expect(e.message).to.contain('Non-expiring tokens are not acceptable');
                            return;
                        }

                        throw new Error(`Should not accept an expired token by default`);
                    });

                    it('accepts expired tokens when configured to do so', async () => {
                        let options : DecodeOptions = { algorithm: 'HS256', secretOrKey: HS256Fixtures.SAMPLE_PUBKEY, validate: { exp: 'ignore' } };
                        let token = await engine.encode({ sub: 'abcdef', exp: Date.now() - 1000 }, options);
                        let validatedToken = await engine.validate(token.string, options);
                        expect(validatedToken.claims.sub).to.equal('abcdef');
                    });
                });
            });

            Object.keys(ALGORITHMS).forEach(alg => testAlgorithm(alg, ALGORITHMS[alg]));

            function testAlgorithm(algorithm : string, fixtures : AlgorithmFixtures) {
                describe(`: Algorithm=${algorithm}`, async () => {
                    it('can verify a token', async () => {
                        let token = await engine.validate(
                            fixtures.SAMPLE_TOKEN, 
                            { 
                                algorithm, 
                                secretOrKey: fixtures.SAMPLE_PUBKEY 
                            }
                        );
                        expect(token.claims.sub).to.equal("1234567890");
                        expect(token.claims.iat).to.equal(1516239022);
                    });
                    it('can detect a forged token', async () => {
                        try {
                            await engine.validate(fixtures.SAMPLE_TOKEN_INVALID, { 
                                algorithm, 
                                secretOrKey: fixtures.SAMPLE_PUBKEY 
                            });
                        } catch (e) {
                            expect(e.message).to.contain('Invalid signature');
                            return;
                        }
    
                        throw new Error('Engine should have detected forgery');
                    });
                    it('fails to verify a token with wrong key', async () => {
                        try {
                            await engine.validate(fixtures.SAMPLE_TOKEN_INVALID, { 
                                algorithm, 
                                secretOrKey: fixtures.SAMPLE_PUBKEY_2
                            });
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
                            algorithm,
                            secretOrKey: fixtures.SAMPLE_PRIVATEKEY
                        });
    
                        try {
                            let validatedToken = await engine.validate(token.string, { 
                                algorithm, 
                                secretOrKey: fixtures.SAMPLE_PUBKEY 
                            });
                            expect(validatedToken.claims.iat).to.equal(1598181440);
                        } catch (e) {
                            console.error(`Caught error during .sign() test:`);
                            console.error(e);
                            throw new Error(`Should be able to validate signed token '${token.string}', caught error: ${e}`);
                        }
                    });
                });
            }

        });
    });
}