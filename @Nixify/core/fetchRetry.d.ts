/**
 * Based on https://github.com/jonbern/fetch-retry/blob/master/index.js
 */
declare const fetchRetry: (request: Request, config: any) => Promise<Response>;

export { fetchRetry as default };
