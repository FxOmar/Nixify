interface OptionsInterface {
  prefixUrl?: Object | string;
}

interface methodsInterface {
  [name: string]: Function;
}

interface MethodsConfigInterface {
  method: string;
  prefixUrl?: string;
  path: string;
  headers: Object;
  responseType: string;
}

class BHR {
  protected __options: OptionsInterface;
  protected __methodsConfig: MethodsConfigInterface;

  constructor(
    __options: OptionsInterface = {},
    methodsConfig: MethodsConfigInterface
  ) {
    this.__options = __options;
    this.__methodsConfig = methodsConfig;
  }

  /**
   * TODO: This Block of code need to be refactored it may cause us a problem in the future.
   */
  protected get __parseURL(): URL {
    try {
      return new URL(
        !this.__options.hasOwnProperty("prefixUrl")
          ? this.__methodsConfig.path
          : (typeof this.__options.prefixUrl === "object" &&
            this.__options.prefixUrl !== null
              ? this.__methodsConfig.prefixUrl
                ? this.__options.prefixUrl[this.__methodsConfig.prefixUrl]
                : Object.values(this.__options.prefixUrl)[0]
              : this.__options.prefixUrl ?? this.__methodsConfig.prefixUrl) +
            this.__methodsConfig.path
      );
    } catch (error) {
      throw new TypeError(error);
    }
  }

  protected get __configuration(): Request {
    const headersConfig: any = { ...this.__methodsConfig.headers };

    return new Request(this.__parseURL.href, {
      method: this.__methodsConfig.method.toLocaleUpperCase(),
      headers: new Headers(headersConfig),
    });
  }

  HttpRequest() {
    const response = new Response();

    if (this.__methodsConfig.responseType in response) {
      return fetch(this.__configuration).then(async (res) => {
        const retrieveHeaders = (headers: Object = {}): Object => {
          for (let pair of res.headers.entries()) {
            headers[pair[0]] = pair[1];
          }

          return headers;
        };

        return {
          data: await res.json(),
          headers: retrieveHeaders(),
          status: res.status,
          statusText: res.statusText,
          config: { ...this.__options, ...this.__methodsConfig },
        };
      });
    }
    throw new Error("Response type not supported");
  }
}

export function createNewInstance(config?: OptionsInterface): methodsInterface {
  const methods: string[] = ["get", "post", "patch"];

  const instance: methodsInterface = {};

  for (let index = 0; index <= methods.length - 1; index++) {
    const method = methods[index];

    instance[method] = (path: string, options?: MethodsConfigInterface) => {
      return new BHR(config, {
        method: method,
        path,
        ...options,
      }).HttpRequest();
    };
  }

  return instance;
}

const http = createNewInstance();

export default http;
