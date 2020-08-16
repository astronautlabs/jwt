import { JWT } from './interface';

export * from './interface';

export function createJWTEngine() : JWT { throw new Error('No implementation selected'); };