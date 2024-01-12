import { RequestMethods, ServiceConfig, XOR, ServiceReqMethods } from './types/index.js';

declare const _default: (RequestMethods & Record<string, never>) | ({
    create: <T extends ServiceConfig>(config?: T) => XOR<ServiceReqMethods<T>, RequestMethods>;
} & Record<string, never>);

export { _default as default };
