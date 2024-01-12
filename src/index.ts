import { RequestMethods, ServiceConfig, ServiceReqMethods, XOR } from "./types"
import nixify from "./core/nixify"

export default { create: nixify.create, ...nixify.create() } as XOR<
	{ create: <T extends ServiceConfig>(config?: T) => XOR<ServiceReqMethods<T>, RequestMethods> },
	RequestMethods
>
