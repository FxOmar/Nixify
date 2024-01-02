import { ServiceConfig, XOR, ServiceReqMethods, RequestMethods } from './interfaces.js';

declare const _default: {
    create: <T extends ServiceConfig>(config?: T) => XOR<ServiceReqMethods<T>, RequestMethods>;
};

export { _default as default };
