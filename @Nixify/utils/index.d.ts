import { Options, MethodConfig, HttpMethod, queryType, ResponseType } from '../types/index.js';

declare function isEmpty(target: any): boolean;
declare function mergeHeaders(baseHeaders: Headers, additionalHeaders: HeadersInit): Headers;
declare const processHeaders: (headers: any) => any;
declare const setHeaders: (target: any, newHeaders: any) => void;
declare const filterRequestOptions: (requestOptions: any) => {};
declare const mergeConfigs: (config: Options, methodConfig: MethodConfig, method: HttpMethod) => {
    method: string;
    url: URL;
    headers: Headers;
    timeout: number | false;
    signal: AbortSignal;
    abortController: AbortController;
    path?: string;
    qs?: {
        readonly strict?: boolean;
        readonly encode?: boolean;
        readonly arrayFormat?: "bracket" | "index" | "comma" | "separator" | "bracket-separator" | "colon-list-separator" | "none";
        readonly arrayFormatSeparator?: string;
        readonly sort?: false | ((itemLeft: string, itemRight: string) => number);
        readonly skipNull?: boolean;
        readonly skipEmptyString?: boolean;
    } | {
        [name: string]: number | queryType;
    };
    json?: object;
    responseType?: ResponseType;
    body?: BodyInit;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    integrity?: string;
    keepalive?: boolean;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    window?: null;
    hooks?: {
        beforeRequest: (request: Request) => void;
        afterResponse: (request: Request, response: Response, config: any) => void;
    };
};

export { filterRequestOptions, isEmpty, mergeConfigs, mergeHeaders, processHeaders, setHeaders };
