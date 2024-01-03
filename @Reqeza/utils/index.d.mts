declare function isEmpty(target: any): boolean;
declare function mergeHeaders(baseHeaders: Headers, additionalHeaders: HeadersInit): Headers;
declare const processHeaders: (headers: any) => any;
declare const setHeaders: (target: any, newHeaders: any) => void;

export { isEmpty, mergeHeaders, processHeaders, setHeaders };
