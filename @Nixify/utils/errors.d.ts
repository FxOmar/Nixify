/**
 *  https://github.com/sindresorhus/ky/blob/main/source/errors/HTTPError.ts
 */
declare class HTTPError extends Error {
    response: Response;
    request: Request;
    constructor(response: Response, request: Request);
}
declare class TimeoutError extends Error {
    request: Request;
    constructor(request: Request);
}
declare class ArgumentError extends Error {
    constructor(message: any);
}

export { ArgumentError, HTTPError, TimeoutError };
