import { a as a$1 } from './chunk-QKR4Q4CV.js';
import { e, a, g as g$1, f } from './chunk-BOYYI7C6.js';
import { a as a$2 } from './chunk-BE5ABZLV.js';
import { a as a$3 } from './chunk-XRZHORBG.js';

var T=["get","head","put","delete","post","patch","options"],b={json:"application/json",text:"text/*",formData:"multipart/form-data",arrayBuffer:"*/*",blob:"*/*"},m=t=>{if(t.url.protocol!=="https:"&&t.url.protocol!=="http:")throw new TypeError(`Unsupported protocol, ${t.url.protocol}`);let o=f(t);return new Request(t.url.toString(),o)},q=async(t,o,r)=>{let n=g$1(t,r,o),s=m(n),e=await a$1(s,n);if(!e.ok)throw new a$2(e.clone(),s);let p={data:null,headers:e.headers,status:e.status,statusText:e.statusText,config:s},a=e.clone(),c=async()=>{if(n.responseType==="json"){if(e.status===204)return "";let u=await a.text();return u.length===0?"":a$3.parse(u)}return await a[n.responseType]()};if(n.responseType)try{p.data=await c();}catch{throw new TypeError(`Unsupported response type "${n.responseType}" specified in the request. The Content-Type of the response is "${e.headers.get("Content-Type")}".`)}return p},w=t=>{let o={};return T.forEach(r=>{o[r]=(n,s)=>{let e$1=s?.responseType||"json",p={...Object.fromEntries(Object.entries(b).map(([a,c])=>[a,()=>(e(t.headers=t?.headers||{},{accept:c}),e$1=a,p)])),then(...a){return q(t,r,{path:n,responseType:e$1,...s}).then(...a)},catch(a){return p.then().catch(a)}};return p};}),o},O=t=>Object.fromEntries(["beforeRetry","afterResponse","beforeRequest"].map(r=>[r,n=>{if(t?.hooks?.[r])throw new TypeError(`${r} has already been invoked within configuration.`);Object.assign(t,{hooks:{...t.hooks||{},[r]:n}});}])),j=t=>{let o=Object.fromEntries(Object.entries(t||{default:{}}).map(([s,e$1])=>[s,{...w(e$1),...O(e$1),setHeaders:p=>e(e$1.headers=e$1.headers||{},p)}])),r=s=>Object.values(o).forEach(s);return a(t)?{...o.default}:{...o,...o[Object.keys(o)[0]],beforeRequest:s=>r(e=>e.beforeRequest(s)),afterResponse:s=>r(e=>e.afterResponse(s)),beforeRetry:s=>r(e=>e.beforeRetry(s)),setHeaders:s=>r(e=>e.setHeaders(s))}},g={create:j};

export { g as a };