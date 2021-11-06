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
}

export function mergeConfiguration(
  target: MethodsConfigInterface,
  config: Object
): MethodsConfigInterface {
  return Object.assign(target, config);
}

export class BHR {
  protected __options: OptionsInterface;
  protected __methodsConfig: MethodsConfigInterface;

  constructor(
    __options: OptionsInterface = {},
    methodsConfig: MethodsConfigInterface
  ) {
    this.__options = __options;
    this.__methodsConfig = methodsConfig;
  }

  protected get __parseURL(): URL {
    let fullURL: string;
    try {
      fullURL = !this.__options.hasOwnProperty("prefixUrl")
        ? this.__methodsConfig.path
        : (typeof this.__options.prefixUrl === "object" &&
          this.__options.prefixUrl !== null
            ? this.__methodsConfig.prefixUrl
              ? this.__options.prefixUrl[this.__methodsConfig.prefixUrl]
              : Object.values(this.__options.prefixUrl)[0]
            : this.__options.prefixUrl ?? this.__methodsConfig.prefixUrl) +
          this.__methodsConfig.path;

      return new URL(fullURL);
    } catch (error) {
      throw new Error(`"Invalid URL: ${fullURL}"`);
    }
  }

  get configuration() {
    const URL = this.__parseURL;

    const configurations = mergeConfiguration(this.__methodsConfig, {
      path: URL.pathname,
      prefixUrl: URL.origin,
    });

    return configurations;
  }
}

function createNewInstance(config?: OptionsInterface): methodsInterface {
  const methods: string[] = ["get", "post"];

  const instance: methodsInterface = {};

  for (let index = 0; index <= methods.length - 1; index++) {
    const method = methods[index];

    instance[method] = (path: string, options?: MethodsConfigInterface) => {
      return new BHR(config, {
        method: method,
        path,
        ...options,
      }).configuration;
    };
  }

  return instance;
}
