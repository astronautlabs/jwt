import { JWTEngine } from '../common';
import { WebCryptoJWT } from './webcrypto-jwt';
export * from '../common';
export * from './webcrypto-jwt';
export function createJWTEngine() : JWTEngine { return new WebCryptoJWT(); };
export const JWT = createJWTEngine();