# @/jwt

> This library is **Alpha quality** in the `0.0.x` series (no automatic updates 
> by semver). Please take caution if you choose to use it, and do not use it 
> in production. We welcome PRs for fixes, features and general improvements.

A simple isomorphic JWT library (works in browser and Node.js) with support for 
signing and verifying JWTs using the `HS256` and `RS256` algorithms.

# Installation

```bash
npm install @astronautlabs/jwt
```

# Usage

## Signing

```typescript
import { JWT } from '@astronautlabs/jwt';

try {
    let token = await JWT.sign({ sub: 123 }, { algorithm: 'HS256', secretOrKey: 'stuff' });
    console.dir(token); // => { string: 'eY...', claims: { sub: ..., ... } }
} catch (e) {
    console.error('Failed to validate token: ');
    console.error(e);
}
```


## Validation

```typescript
import { JWT } from '@astronautlabs/jwt';

try {
    let token = await JWT.validate(`eY...`, { algorithm: 'HS256', secretOrKey: 'stuff' });
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
- `ES256`