export { ValidationError, ResponseError } from "./errors";

export function mergeObjects(target = {}, source) {
  return Object.assign(target, ...source);
}
