interface OptionsInterface {
  method: string;
}

interface methodsInterface {
  [name: string]: Function;
}

export class BHR {
  protected __options: OptionsInterface;

  constructor(__options: OptionsInterface) {
    this.__options = __options;
  }

  fetchData(url) {
    return this.__options.method + " " + url;
  }
}

function instance(): methodsInterface {
  const methods: string[] = ["get", "post"];

  const methodsFunction: methodsInterface = {};

  for (let index = 0; index <= methods.length - 1; index++) {
    const method = methods[index];

    methodsFunction[method] = (url: string): Object =>
      new BHR({
        method: method,
      }).fetchData(url);
  }

  return methodsFunction;
}

const http = instance();

console.log(http.get("https://www.google.com/"));
