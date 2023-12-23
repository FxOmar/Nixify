export { HTTPError, ResponseError } from "./errors";

export function mergeObjects(target = {}, source) {
  return Object.assign(target, ...source);
}

export function isNullOrEmpty(target: object) {
  return (
    target === null || target === undefined || Object.keys(target).length === 0
  );
}

export function has(target: object, key: string): boolean {
  return isNullOrEmpty(target)
    ? false
    : Object.hasOwnProperty.call(target, key);
}

export function getBaseUrl(config, methodConfig) {
  const prefixUrl = config?.PREFIX_URL;

  if (typeof prefixUrl === "string") {
    return prefixUrl;
  } else if (typeof prefixUrl === "object" && methodConfig.PREFIX_URL) {
    return prefixUrl[methodConfig.PREFIX_URL];
  } else if (prefixUrl) {
    return Object.values(prefixUrl)[0];
  }

  return undefined;
}

/**
 * Based on: https://github.com/request/caseless/blob/master/index.js
 */
class Caseless {
  private dict;

  constructor(dict = {}) {
    this.dict = dict;
  }

  set(name, value, clobber?) {
    if (typeof name === "object") {
      for (const i in name) {
        this.set(i, name[i], value);
      }
    } else {
      if (typeof clobber === "undefined") clobber = true;
      const has = this.has(name);

      if (!clobber && has) this.dict[has] = `${this.dict[has]},${value}`;
      else this.dict[has || name] = value;
      return has;
    }
  }

  has(name) {
    const keys = Object.keys(this.dict);
    name = name.toLowerCase();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === name) return keys[i];
    }
    return false;
  }
}

export const caseless = (dict: object) => {
  return new Caseless(dict);
};
