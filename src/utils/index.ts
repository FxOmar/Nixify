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
