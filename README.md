# @/jwt

> This library is **Alpha quality** in the `0.0.x` series (no automatic updates 
> by semver). Please take caution if you choose to use it, and do not use it 
> in production. We welcome PRs for fixes, features and general improvements.

A simple isomorphic JWT library (works in browser and Node.js) with support for 
signing and verifying JWTs using a number of common algorithms.

# Installation

```bash
npm install @astronautlabs/jwt
```

# Usage

## Common Options

- `now` -- Specify the UNIX wall clock time to use when enforcing `exp` claims. When not specified, `Date.now()` is used.
- `algorithm` -- The signature algorithm to use. See [Supported Algorithms](#supported-algorithms) for the options.
- `secretOrKey` -- The key to use for the operation. When using asymmetric
  algorithms (like `RS256`, `ES256`, etc) you should pass public keys for 
  `validate()` and private keys for `encode()`

## Signing

```typescript
    async encode(claims: any, options: EncodeOptions): Promise<Token>
```

### Remarks

Returns a `Token` object with the given claims, and signed by the credentials
specified in `options` (see `algorithm` and `secretOrKey`).

### Example

```typescript
import { JWT } from '@astronautlabs/jwt';

try {
    let token = await JWT.encode({ sub: 123 }, { algorithm: 'HS256', secretOrKey: 'stuff' });
    console.dir(token); // => { string: 'eY...', claims: { sub: ..., ... } }
} catch (e) {
    console.error('Failed to validate token: ');
    console.error(e);
}
```


## Validation

```typescript
JWT.validate(string : string, options: DecodeOptions): Promise<Token>
```

Returns a `Token` object if the given string is a valid (and trusted) JWT.
If validation fails, throws an `Error`.

Types of errors `JWT.validate()` can throw:
- Algorithm mismatch: If the token header's `alg` claim does not match the 
  configured algorithm (`options.algorithm`)
- Signature mismatch: If the signature does not match
- Expiration: If the token's `exp` claim is not acceptable according to policy

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

### Expiration

You can configure a policy for built-in validation of the `exp` claim when validating tokens.
To do so, specify `{ validate: { exp: "(policyName)" }}` within the `options` passed to `JWT.validate()`.

The available policies are:
- `when-present` (default) -- When a token has an `exp` claim, fail validation if the token is expired
- `force` -- Require tokens to have a valid (fresh) `exp` claim
- `ignore` -- Ignore `exp` even when it is present (it will still be available on `token.claims`).  

You can override the current time by providing `options.now`. Consider using this instead 
of `options.validate.exp = 'ignore'`.

### Options

- `validate`
  * `exp` -- Expiration policy. For more see [Expiration](#expiration)

# Supported Platforms
- **Browser/Web** using WebCrypto
- **Node.js**

# Supported Algorithms
- `HS256`
- `HS384`
- `HS512`
- `RS256`
- `RS512`
- `ES256`