var e=class extends Error{constructor(t,o){let c=t.status||t.status===0?t.status:"",n=t.statusText||"",s=`${c} ${n}`.trim(),a=s?`status code ${s}`:"an unknown error";super(`Request failed with ${a}`),this.name="HTTPError",this.response=t,this.request=o;}},u=class extends Error{constructor(t){super("Request timed out"),this.name="TimeoutError",this.request=t;}};

export { e as a, u as b };
