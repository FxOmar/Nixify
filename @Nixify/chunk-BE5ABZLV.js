var r=class extends Error{constructor(t,c){let n=t.status||t.status===0?t.status:"",a=t.statusText||"",e=`${n} ${a}`.trim(),i=e?`status code ${e}`:"an unknown error";super(`Request failed with ${i}`),this.name="HTTPError",this.response=t,this.request=c;}},u=class extends Error{constructor(t){super("Request timed out"),this.name="TimeoutError",this.request=t;}},o=class extends Error{constructor(t){super(t),this.name="ArgumentError";}};

export { r as a, u as b, o as c };
