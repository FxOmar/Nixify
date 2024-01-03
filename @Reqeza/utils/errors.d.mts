import { NormalizedOptions } from '../types/index.mjs';

/**
 *  Code source.
 *  https://github.com/sindresorhus/ky/blob/main/source/errors/HTTPError.ts
 */

declare class HTTPError extends Error {
    response: Response;
    request: Request;
    options: NormalizedOptions;
    constructor(response: Response, request: Request, options: NormalizedOptions);
}
declare function ResponseError(response: any, request: any, config: any): any;

export { HTTPError, ResponseError };
