
export class Base64URL {
    public static stringify(a) {
        let base64string = btoa(String.fromCharCode.apply(0, a));
        return base64string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    public static parse(s) {
        s = s.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return new Uint8Array(Array.prototype.map.call(atob(s), c => c.charCodeAt(0)));
    }
}
