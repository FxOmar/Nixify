import { a } from './chunk-D22QKJZO.js';

var e=class extends Error{constructor(t,n,u){let a$1=t.status||t.status===0?t.status:"",c=t.statusText||"",r=`${a$1} ${c}`.trim(),p=r?`status code ${r}`:"an unknown error";super(`Request failed with ${p}`);a(this,"response");a(this,"request");a(this,"options");this.name="HTTPError",this.response=t,this.request=n,this.options=u;}};function l(s,i,t){if(!s.ok)throw new e(s,i,t);return s}

export { e as a, l as b };
