var e=class extends Error{constructor(t,o,r){let n=t.status||t.status===0?t.status:"",u=t.statusText||"",i=`${n} ${u}`.trim(),a=i?`status code ${i}`:"an unknown error";super(`Request failed with ${a}`),this.name="HTTPError",this.response=t,this.request=o,this.options=r;}};function c(s,t,o){if(!s.ok)throw new e(s,t,o);return s}

export { e as a, c as b };
