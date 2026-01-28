if (typeof window !== 'undefined') {
    (window as any)['process'] = { 
        env: {},
        argv: [],
        version: '99.99.99'
    };
}