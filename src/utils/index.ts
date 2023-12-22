export { ValidationError, ResponseError } from "./errors";

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
