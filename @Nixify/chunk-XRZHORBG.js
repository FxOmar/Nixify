var s=typeof TextDecoder<"u",a=new TextDecoder("utf-8"),i=/"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/,u=(e,t="remove",r)=>{s&&(e instanceof Uint8Array||e instanceof ArrayBuffer)&&(e=a.decode(e)),e&&e.charCodeAt(0)===65279&&(e=e.slice(1));let o=JSON.parse(e,r);return !o||typeof o!="object"||!e.match(i)||p(o,t),o},p=(e,t)=>{let r=[e];for(;r.length;){let o=r;r=[];for(let n of o){if(Object.prototype.hasOwnProperty.call(n,"__proto__")){if(t==="error")throw new SyntaxError("Object contains forbidden prototype property");delete n.__proto__;}for(let f in n){let c=n[f];c&&typeof c=="object"&&r.push(n[f]);}}}},d={parse:u};

export { d as a };