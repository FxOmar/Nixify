/**
 *  Code source.
 *  https://github.com/sindresorhus/ky/blob/main/source/errors/HTTPError.ts
 */

import { NormalizedOptions } from "../interfaces";

export class HTTPError extends Error {
  public response: Response;
  public request: Request;
  public options: NormalizedOptions;

  constructor(
    response: Response,
    request: Request,
    options: NormalizedOptions
  ) {
    const code =
      response.status || response.status === 0 ? response.status : "";
    const title = response.statusText || "";
    const status = `${code} ${title}`.trim();
    const reason = status ? `status code ${status}` : "an unknown error";

    super(`Request failed with ${reason}`);

    this.name = "HTTPError";
    this.response = response;
    this.request = request;
    this.options = options;
  }
}

export function ResponseError(response, request, config) {
  if (!response.ok) {
    throw new HTTPError(response, request, config);
  }

  return response;
}
