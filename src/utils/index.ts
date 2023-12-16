export { ValidationError, ResponseError } from "./errors";

export function mergeObjects(target = {}, source) {
  return Object.assign(target, ...source);
}

export function has(target: object, key: string): boolean {
  return Object.hasOwnProperty.call(target, key);
}
