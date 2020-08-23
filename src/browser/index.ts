import { JWT } from '../common';
import { WebCryptoJWT } from './webcrypto-jwt';
export * from '../common';
export * from './webcrypto-jwt';
export function createJWTEngine() : JWT { return new WebCryptoJWT(); };