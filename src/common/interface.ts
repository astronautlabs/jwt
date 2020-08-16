export interface Options {
    secretOrKey? : string;
    algorithm? : string;
}

export interface EncodeOptions extends Options {
}

export interface DecodeOptions extends Options {
    whenInvalid? : 'throw' | 'null';
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


export interface JWT {
    encode(claims : Record<string,any>, options : EncodeOptions) : Promise<Token>;
    validate(token : string, options : DecodeOptions) : Promise<Token>;
}