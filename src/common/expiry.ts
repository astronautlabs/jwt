export function validateExpiry(exp : number, now : number, policy : 'ignore' | 'when-present' | 'force') {
    
    // Define acceptable policies

    const supportedPolicies = [
        'when-present', 'force', 'ignore'
    ];

    // Set defaults

    policy = policy || 'when-present';
    now = now || Date.now();

    if (!supportedPolicies.includes(policy)) 
        throw new Error(`Unsupported 'exp' validation strategy '${policy}'`);

    if (policy !== 'ignore') {
        if (typeof exp !== 'undefined') {
            if (exp < now)
                throw new Error(`Token is expired`);
        } else if (policy === 'force') {
            throw new Error(`Non-expiring tokens are not acceptable`);
        }
    }
}