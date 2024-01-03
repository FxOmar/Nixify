import { ServiceConfig, XOR, ServiceReqMethods, RequestMethods } from './types/index.mjs';

declare const _default: {
    create: <T extends ServiceConfig>(config?: T) => XOR<ServiceReqMethods<T>, RequestMethods>;
};

export { _default as default };
