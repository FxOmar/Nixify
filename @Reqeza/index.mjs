var R=Object.defineProperty,m=Object.defineProperties;var l=Object.getOwnPropertyDescriptors;var d=Object.getOwnPropertySymbols;var C=Object.prototype.hasOwnProperty,O=Object.prototype.propertyIsEnumerable;var f=(s,t,e)=>t in s?R(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e,h=(s,t)=>{for(var e in t||(t={}))C.call(t,e)&&f(s,e,t[e]);if(d)for(var e of d(t))O.call(t,e)&&f(s,e,t[e]);return s},u=(s,t)=>m(s,l(t));var n=class extends Error{constructor(t){super(t),this.name="ValidationError",this.message=t}toJSON(){return{error:{name:this.name,message:this.message,stacktrace:this.stack}}}};function p(s){if(!s.ok)throw new n(s.statusText);return s}var E=["get","head","put","delete","post","patch","options"],j=["json","text","blob","arrayBuffer","formData"],_=class{constructor(t={},e){this.__options=t;this.__methodsConfig=e;this.__options=t,this.__methodsConfig=e}get __parseURI(){var t;try{return new URL(Object.hasOwnProperty.call(this.__options,"PREFIX_URL")?(typeof this.__options.PREFIX_URL=="object"&&this.__options.PREFIX_URL!==null?this.__methodsConfig.PREFIX_URL?this.__options.PREFIX_URL[this.__methodsConfig.PREFIX_URL]:Object.values(this.__options.PREFIX_URL)[0]:(t=this.__options.PREFIX_URL)!=null?t:this.__methodsConfig.PREFIX_URL)+this.__methodsConfig.path:this.__methodsConfig.path)}catch(e){throw new n("The given URI is invalid.")}}get __configuration(){let t=new Headers(this.__methodsConfig.headers);return["post","put","patch"].includes(this.__methodsConfig.method)&&Object.hasOwnProperty.call(this.__methodsConfig,"json")&&!Object.hasOwnProperty.call(this.__methodsConfig,"headers['Content-Type']")&&t.append("Content-Type","application/json; charset=UTF-8"),new Request(this.__parseURI.href,{method:this.__methodsConfig.method.toLocaleUpperCase(),headers:t,body:Object.hasOwnProperty.call(this.__methodsConfig,"json")?JSON.stringify(this.__methodsConfig.json):this.__methodsConfig.body,signal:this.__methodsConfig.signal})}httpAdapter(){let t=this.__configuration;return fetch(t).then(p).then(async e=>{let i=()=>{let r={};for(let o of e.headers.entries())r[o[0]]=o[1];return r};return{data:await(()=>e[this.__methodsConfig.responseType]())(),headers:i(),status:e.status,statusText:e.statusText,config:t}})}},g={create(s){let t=E.map(e=>({[e]:(i,c)=>{let a="json",r=u(h({},Object.assign({},...j.map(o=>({[o]:()=>(a=o,r)})))),{then(o){return new _(s,h({path:i,method:e,responseType:a},c)).httpAdapter().then(o)}});return r}}));return Object.assign({},...t)}},T=Object.assign(g,g.create());export{T as default};
//# sourceMappingURL=index.mjs.map