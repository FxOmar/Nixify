import { a as a$1 } from './chunk-57VF4OXY.js';

var r=async(t,e)=>(e?.hooks?.beforeRequest&&await e.hooks.beforeRequest(t),e.timeout===!1?fetch(t.clone()):a$1(t.clone(),e.abortController,e.timeout)),a=r;

export { a };
