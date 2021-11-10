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

  get __configuration(): Request {
    const headersConfig: any = { ...this.__methodsConfig.headers };

    if (this.__methodsConfig.responseType === "json") {
      Object.assign(headersConfig, { "Content-Type": "application/json" });
    }

    return new Request(this.__parseURL.href, {
      method: this.__methodsConfig.method.toLocaleUpperCase(),
      headers: new Headers(headersConfig),
    });
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
      }).__configuration;
    };
  }

  return instance;
}

export default createNewInstance();
