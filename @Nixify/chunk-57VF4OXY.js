import { b } from './chunk-BE5ABZLV.js';

var f=(e,o,r)=>new Promise((n,t)=>{let m=setTimeout(()=>{o&&o.abort(),t(new b(e));},r);fetch(e).then(n).catch(t).finally(()=>{clearTimeout(m);});});

export { f as a };
