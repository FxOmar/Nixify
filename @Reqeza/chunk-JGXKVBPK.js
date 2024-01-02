function c(e){return e==null||Object.keys(e).length===0}function o(e,n){let s=new Headers(e);if(n instanceof Headers)n.forEach((r,t)=>{s.append(t,r);});else if(typeof n=="object")for(let[r,t]of Object.entries(n))s.append(r,t);return s}var f=(e,n)=>{Object.assign(e,{...n});};

export { c as a, o as b, f as c };
