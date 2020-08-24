export interface Options {
    secretOrKey? : string;
    algorithm? : string;

    /**
     * Assume the given UNIX clock time in milliseconds (as would be returned by Date.now()).
     * When not specified, Date.now() is used to get the current time.
     */
    now? : number; 
}

export interface EncodeOptions extends Options {
}

export interface DecodeOptions extends Options {
    validate?: ValidateOptions;
}

export interface ValidateOptions {
    /**
     * Whether to automatically verify the `exp` claim. 
     * When not specified, default is 'when-present'.
     * Set `now` option to override the current time.
     */
    exp? : 'when-present' | 'force' | 'ignore';
}

export interface Token {
    string : string;
    claims : Record<string, any>;
}

export interface DecodedToken {
    encodedHeader : string;
    encodedPayload : string;
    signature : string;

    header : Record<string,any>;
    payload : Record<string,any>;
}


export interface JWTEngine {
    encode(claims : Record<string,any>, options : EncodeOptions) : Promise<Token>;
    validate(token : string, options : DecodeOptions) : Promise<Token>;
}