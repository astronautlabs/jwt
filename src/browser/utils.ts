import { Base64URL } from "./base64url";

export class Utils {
    public static isString(s) {
        return typeof s === 'string';
    }

    public static utf8ToUint8Array(str) {
        var chars = [];
        str = btoa(unescape(encodeURIComponent(str)));
        return Base64URL.parse(str);
    }

    public static isFunction(fn) {
        return typeof fn === 'function';
    }

    public static isObject(arg) {
        return arg !== null && typeof arg === 'object';
    }
}