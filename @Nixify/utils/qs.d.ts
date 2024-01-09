import { Stringify } from '../types/index.js';

/**
 * https://github.com/sindresorhus/query-string/blob/main/base.js
 */

declare function encode(value: any, options: any): any;
declare const qs: {
    stringify: Stringify;
};

export { encode, qs };
