import { a } from './chunk-J2XKEFHB.js';
import { a as a$1 } from './chunk-XRZHORBG.js';

var m=async(a$2,r)=>{let{retries:u,retryDelay:n,retryOn:s}=r.retryConfig;return delete r.abortController,new Promise((y,c)=>{let f=async(t,e)=>{e.json=async()=>a$1.parse(await e.clone().text());let i=typeof n=="function"?n(t,e):n;r?.hooks?.beforeRetry&&await r.hooks.beforeRetry(a$2,e,t,i),setTimeout(()=>h(++t),i);},h=async t=>{try{let e=await a(a$2,r);r?.hooks?.afterResponse&&(e.json=async()=>a$1.parse(await e.clone().text()),await r.hooks.afterResponse(a$2,e,r)),(()=>{if(Array.isArray(s)&&s.indexOf(e.status)===-1)y(e);else if(typeof s=="function")try{e.json=async()=>a$1.parse(await e.clone().text()),Promise.resolve(s(t,e)).then(R=>{R?f(t,e):y(e);}).catch(c);}catch(R){c(R);}else t<u?f(t,e):y(e);})();}catch(e){c(e);}};h(0);})},d=m;

export { d as a };
