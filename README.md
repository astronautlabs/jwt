# @/jwt

A simple isomorphic JWT library (works in browser and Node.js) with support for 
signing and verifying JWTs using the `HS256` and `RS256` algorithms.

# Installation

```bash
npm install @astronautlabs/jwt
```

# Usage

## Signing

```typescript
import { createJWTEngine } from '@astronautlabs/jwt';

let jwt = createJWTEngine();

try {
    let token = await jwt.sign({ sub: 123 }, { algorithm: 'HS256', secretOrKey: 'stuff' });
    console.dir(token); // => { string: 'eY...', claims: { sub: ..., ... } }
} catch (e) {
    console.error('Failed to validate token: ');
    console.error(e);
}
```


## Validation

```typescript
import { createJWTEngine } from '@astronautlabs/jwt';

let jwt = createJWTEngine();

try {
    let token = await jwt.validate(`eY...`, { algorithm: 'HS256', secretOrKey: 'stuff' });
    console.dir(token); // => { string: 'eY...', claims: { sub: ..., ... } }
} catch (e) {
    console.error('Failed to validate token: ');
    console.error(e);
}
```

# Supported Platforms
- **Browser/Web** using WebCrypto
- **Node.js**

# Supported Algorithms
- `RS256`
- `HS256`