interface Reviver {
    (this: any, key: string, value: any): any;
}
declare const _default: {
    parse: (text: any, protoAction?: "error" | "remove", reviver?: Reviver) => any;
};

export { _default as default };
