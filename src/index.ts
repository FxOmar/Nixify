interface OptionsInterface {
  method: string;
  prefixUrl?: Object | string;
}

interface methodsInterface {
  [name: string]: Function;
}

interface shortcutOptionsInterface {
  prefixUrl: string;
}

export class BHR {
  protected __options: OptionsInterface;

  constructor(__options: OptionsInterface) {
    this.__options = __options;
  }

  fetchData(url, options: shortcutOptionsInterface) {
    const prefixUrl =
      typeof this.__options.prefixUrl === "object" &&
      this.__options.prefixUrl !== null
        ? options.prefixUrl
          ? this.__options.prefixUrl[options.prefixUrl]
          : Object.values(this.__options.prefixUrl)[0]
        : this.__options.prefixUrl ?? options.prefixUrl;

    return `[${this.__options.method}] ${prefixUrl}${url}`;
  }
}

function createNewInstance(config?: Object): methodsInterface {
  const methods: string[] = ["get", "post"];

  const instance: methodsInterface = {};

  for (let index = 0; index <= methods.length - 1; index++) {
    const method = methods[index];

    instance[method] = (
      url: string,
      options?: shortcutOptionsInterface
    ): Object =>
      new BHR({
        method: method,
        ...config,
      }).fetchData(url, options);
  }

  return instance;
}

const http = createNewInstance({
  prefixUrl: {
    API: "www.google.com",
    api_1: "www.airbit.com",
  },
});

console.log(http.get("/emoji"));
