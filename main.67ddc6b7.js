(()=>{var e,t,n,o={27336:(e,t,n)=>{"use strict";var o=n(85893),i=n(73935),s=n(51521),a=n(67294),r=n(71570);const l='// Try typing or pasting some code into the left editor!\nimport React, { Component } from "react";\n\ntype Reducer<T, U> = (u: U, t: T) => U;\n\nfunction reduce<T, U>(arr: Array<T>, reducer: Reducer<T, U>, base: U): U {\n  let acc = base;\n  for (const value of arr) {\n    acc = reducer(acc, value);\n  }\n  return acc;\n}\n\nclass App extends Component {\n  render() {\n    return <span>Hello, world!</span>;\n  }\n}\n\nconst OtherComponent = React.createClass({\n  render() {\n    return null;\n  }\n});\n\nexport default App;\n\n',c=["jsx","typescript","flow","imports","react-hot-loader","jest"],d={transforms:["jsx","typescript","imports"],disableESTransforms:!1,production:!1,jsxRuntime:"classic",jsxImportSource:"react",jsxPragma:"React.createElement",jsxFragmentPragma:"React.Fragment",preserveDynamicImport:!1,injectCreateRequireForImportRequire:!1,enableLegacyTypeScriptModuleInterop:!1,enableLegacyBabel5ModuleInterop:!1},p={compareWithBabel:!0,compareWithTypeScript:!1,showTokens:!1};function u({label:e,checked:t,onChange:n}){return(0,o.jsxs)("label",{className:(0,s.iv)(h.label),children:[(0,o.jsx)("input",{type:"checkbox",className:(0,s.iv)(h.checkbox),checked:t,onChange:e=>{n(e.target.checked)}}),e]})}const h=s.mM.create({label:{display:"flex",alignItems:"center",marginLeft:6,marginRight:6},checkbox:{marginRight:4}});function m({children:e}){return(0,o.jsx)("div",{className:(0,s.iv)(f.optionsBox),children:e})}const f=s.mM.create({optionsBox:{display:"inline-flex",border:"1px solid white",borderRadius:6,margin:10,padding:4,backgroundColor:"#333333"}});function y({displayOptions:e,onUpdateDisplayOptions:t}){return(0,o.jsx)(m,{children:(0,o.jsxs)("div",{className:(0,s.iv)(b.optionBox),children:[(0,o.jsx)("span",{className:(0,s.iv)(b.title),children:"Compare"}),(0,o.jsx)(u,{label:"Babel",checked:e.compareWithBabel,onChange:n=>{t({...e,compareWithBabel:n})}}),(0,o.jsx)(u,{label:"TypeScript",checked:e.compareWithTypeScript,onChange:n=>{t({...e,compareWithTypeScript:n})}}),(0,o.jsx)(u,{label:"Tokens",checked:e.showTokens,onChange:n=>{t({...e,showTokens:n})}})]})})}const b=s.mM.create({optionBox:{display:"flex",flexWrap:"wrap",alignItems:"center"},title:{fontSize:"1.2em",padding:6}});var g=n(11728);class x extends a.Component{constructor(...e){super(...e),x.prototype.__init.call(this),x.prototype.__init2.call(this),x.prototype.__init3.call(this)}__init(){this.editor=null}componentDidMount(){setTimeout(this.invalidate,0)}__init2(){this._editorDidMount=(e,t)=>{this.editor=e,t.languages.typescript.typescriptDefaults.setDiagnosticsOptions({noSemanticValidation:!0,noSyntaxValidation:!0,noSuggestionDiagnostics:!0}),this.invalidate()}}__init3(){this.invalidate=()=>{this.editor&&this.editor.layout()}}render(){const{MonacoEditor:e,code:t,onChange:n,isReadOnly:i,isPlaintext:s,options:a,width:r,height:l}=this.props;return(0,o.jsx)(e,{editorDidMount:this._editorDidMount,width:r,height:l,language:s?void 0:"typescript",theme:"vs-dark",value:t,onChange:n,options:{minimap:{enabled:!1},readOnly:i,...a}})}}function w({width:e,height:t,code:n,onChange:i,isReadOnly:a}){return(0,o.jsx)("textarea",{className:(0,s.iv)(v.editor),style:{width:e,height:t},value:n,onChange:i&&(e=>{i(e.target.value)}),spellCheck:!1,readOnly:a,wrap:"off"})}const v=s.mM.create({editor:{border:0,color:"#d4d4d4",backgroundColor:"#1e1e1e",fontFamily:'Menlo, Monaco, "Courier New", monospace',fontSize:12,resize:"none",outline:0,padding:0,paddingLeft:62,lineHeight:"18px"}});class O extends a.Component{constructor(...e){super(...e),O.prototype.__init.call(this),O.prototype.__init2.call(this),O.prototype.__init3.call(this)}__init(){this.state={MonacoEditor:null}}__init2(){this.editor=null}async componentDidUpdate(e){this.props.babelLoaded&&!this.state.MonacoEditor&&this.setState({MonacoEditor:(await n.e(493).then(n.bind(n,81493))).default})}__init3(){this.invalidate=()=>{this.editor&&this.editor.invalidate()}}_formatTime(){const{timeMs:e}=this.props;return null==e?"":"LOADING"===e?" (...)":` (${Math.round(100*e)/100}ms)`}render(){const{MonacoEditor:e}=this.state,{label:t,code:n,onChange:i,isReadOnly:a,isPlaintext:r,options:l}=this.props;return(0,o.jsxs)("div",{className:(0,s.iv)(C.editor),children:[(0,o.jsxs)("span",{className:(0,s.iv)(C.label),children:[t,this._formatTime()]}),(0,o.jsx)("span",{className:(0,s.iv)(C.container),children:(0,o.jsx)(g.Z,{onResize:this.invalidate,defaultWidth:300,defaultHeight:300,children:({width:t,height:s})=>e?(0,o.jsx)(x,{ref:e=>{this.editor=e},MonacoEditor:e,width:t,height:s-30,code:n,onChange:i,isPlaintext:r,isReadOnly:a,options:l}):(0,o.jsx)(w,{width:t,height:s-30,code:n,onChange:i,isReadOnly:a})})})]})}}const C=s.mM.create({editor:{display:"flex",flexDirection:"column",minWidth:300,height:"100%",flex:1,overflowX:"hidden",margin:8},label:{color:"white",lineHeight:"30px",padding:8},container:{height:"100%"}});function j({options:e,value:t,onChange:n}){return(0,o.jsx)("select",{className:(0,s.iv)(S.select),value:t,onChange:e=>{n(e.target.value)},children:e.map((e=>(0,o.jsx)("option",{value:e,children:e},e)))})}const S=s.mM.create({select:{backgroundColor:"#222222",color:"white",border:0,fontFamily:"monospace"}});function T({value:e,onChange:t,width:n}){return(0,o.jsx)("input",{type:"text",className:(0,s.iv)(N.input),style:{width:n},value:e,onChange:e=>{t(e.target.value)}})}const N=s.mM.create({input:{backgroundColor:"#222222",color:"white",border:0,fontFamily:"monospace"}});function k(e,t){return e.filter((e=>e!==t))}function E({optionName:e,options:t,onUpdateOptions:n}){return(0,o.jsx)(u,{label:(0,o.jsx)("span",{className:(0,s.iv)(U.optionName),children:e}),checked:t[e],onChange:o=>{n({...t,[e]:o})}})}function R({optionName:e,options:t,onUpdateOptions:n,inputWidth:i}){return(0,o.jsxs)("div",{className:(0,s.iv)(U.option),children:[(0,o.jsx)("input",{type:"checkbox",className:(0,s.iv)(U.hiddenCheckbox)}),(0,o.jsxs)("span",{className:(0,s.iv)(U.optionName),children:[e,":"," ",(0,o.jsx)(T,{value:t[e],onChange:o=>{n({...t,[e]:o})},width:i})]})]})}function _({options:e,onUpdateOptions:t}){return(0,o.jsxs)("div",{className:(0,s.iv)(U.option),children:[(0,o.jsx)("input",{type:"checkbox",className:(0,s.iv)(U.hiddenCheckbox)}),(0,o.jsxs)("span",{className:(0,s.iv)(U.optionName),children:["jsxRuntime:"," ",(0,o.jsx)(j,{options:["classic","automatic"],value:e.jsxRuntime,onChange:n=>{t({...e,jsxRuntime:n})}})]})]})}function M({options:e,onUpdateOptions:t}){const[n,i]=(0,a.useState)(!1);return(0,o.jsx)(m,{children:(0,o.jsxs)("div",{className:(0,s.iv)(U.container),children:[(0,o.jsxs)("div",{className:(0,s.iv)(U.mainOptions),children:[(0,o.jsx)("span",{className:(0,s.iv)(U.title),children:"Options"}),c.filter((e=>n||["jsx","typescript","flow","imports"].includes(e))).map((n=>(0,o.jsx)(u,{label:n,checked:e.transforms.includes(n),onChange:o=>{let i=e.transforms;o?("typescript"===n?i=k(i,"flow"):"flow"===n&&(i=k(i,"typescript")),i=function(e,t){if(e.includes(t))return e;const n=[...e,t];return n.sort(((e,t)=>c.indexOf(e)-c.indexOf(t))),n}(i,n)):i=k(i,n),t({...e,transforms:i})}},n))),(0,o.jsx)("a",{href:"#more",className:(0,s.iv)(U.link),onClick:e=>{i(!n),e.preventDefault()},children:n?"Collapse":"More..."})]}),n&&(0,o.jsxs)("div",{className:(0,s.iv)(U.secondaryOptions),children:[(0,o.jsxs)("div",{className:(0,s.iv)(U.secondaryOptionColumn),children:[(0,o.jsx)(E,{optionName:"disableESTransforms",options:e,onUpdateOptions:t}),e.transforms.includes("jsx")&&(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(_,{options:e,onUpdateOptions:t}),(0,o.jsx)(E,{optionName:"production",options:e,onUpdateOptions:t}),"classic"===e.jsxRuntime&&(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(R,{optionName:"jsxPragma",options:e,onUpdateOptions:t,inputWidth:182}),(0,o.jsx)(R,{optionName:"jsxFragmentPragma",options:e,onUpdateOptions:t,inputWidth:120})]}),"automatic"===e.jsxRuntime&&(0,o.jsx)(R,{optionName:"jsxImportSource",options:e,onUpdateOptions:t,inputWidth:116})]})]}),(0,o.jsxs)("div",{className:(0,s.iv)(U.secondaryOptionColumn),children:[e.transforms.includes("imports")&&(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(E,{optionName:"preserveDynamicImport",options:e,onUpdateOptions:t}),(0,o.jsx)(E,{optionName:"enableLegacyTypeScriptModuleInterop",options:e,onUpdateOptions:t}),(0,o.jsx)(E,{optionName:"enableLegacyBabel5ModuleInterop",options:e,onUpdateOptions:t})]}),!e.transforms.includes("imports")&&e.transforms.includes("typescript")&&(0,o.jsx)(E,{optionName:"injectCreateRequireForImportRequire",options:e,onUpdateOptions:t})]})]})]})})}const U=s.mM.create({container:{display:"flex",flexDirection:"column"},title:{fontSize:"1.2em",padding:6},mainOptions:{display:"flex",flexWrap:"wrap",alignItems:"center"},link:{color:"#CCCCCC",marginLeft:6,marginRight:6},secondaryOptions:{display:"flex",justifyContent:"space-around"},secondaryOptionColumn:{display:"flex",flexDirection:"column"},option:{marginLeft:6,marginRight:6,display:"flex"},hiddenCheckbox:{visibility:"hidden"},optionName:{fontFamily:"monospace"}});var L=n(79742),A=n(53606),I=n.n(A),D=n(10746);function B(e,t){const n=d[e];if("boolean"==typeof n)return"true"===t;if("string"==typeof n)return t;if(Array.isArray(n))return t.split(",");throw new Error(`Unexpected type when reading option ${e}`)}const P="SUCRASE JOB CANCELLED",W="SUCRASE JOB TIMED OUT";let F,z=null,$=null,G=null,q=null,H=null,J=null,Y=null;function V(){F=new Worker(new URL(n.p+n.u(199),n.b)),F.addEventListener("message",(({data:e})=>{if("RESPONSE"===e.type){if(!z)throw new Error("Expected nextResolve to be set.");z(e.response),K()}else"BABEL_LOADED"===e.type?J&&J({babelLoaded:!0}):"TYPESCRIPT_LOADED"===e.type&&J&&J({typeScriptLoaded:!0})}))}function K(){z=null,$=null,null!=G&&window.clearTimeout(G)}function X(e){if(q)throw new Error(P);if(F.postMessage(e),z||$)throw new Error("Cannot send message when a message is already in progress!");return G=window.setTimeout((()=>{if(F.terminate(),V(),!$)throw new Error("Expected nextReject to be set!");$(new Error(W)),K()}),1e4),new Promise(((e,t)=>{z=e,$=t}))}async function Z(e){await X({type:"SET_CONFIG",config:e})}async function Q(){return await X({type:"RUN_SUCRASE"})}async function ee(){return await X({type:"RUN_BABEL"})}async function te(){return await X({type:"RUN_TYPESCRIPT"})}async function ne(){return await X({type:"COMPRESS_CODE"})}async function oe(){return await X({type:"GET_TOKENS"})}async function ie(){return await X({type:"PROFILE_SUCRASE"})}async function se(){return await X({type:"PROFILE_BABEL"})}async function ae(){return await X({type:"PROFILE_TYPESCRIPT"})}async function re(){if(q){const e=q;return q=null,e}{const e=new Promise((e=>{H=e}));await e,H=null;const t=q;if(null==t)throw new Error("Unexpected missing config after notify.");return q=null,t}}async function le(e){for(let t=0;t<2;t++)if(null==await e())return null;let t=0;for(let n=0;n<10;n++){const n=await e();if(null==n)return null;t+=n}return t/10}V(),async function(){for(;;){const e=await re();if(!J||!Y)throw new Error("Expected update callbacks to be set before config is set.");try{await Z(e);const t=await Q(),n=e.displayOptions.compareWithBabel?await ee():"",o=e.displayOptions.compareWithTypeScript?await te():"",i=e.displayOptions.showTokens?await oe():"";J({sucraseCode:t,babelCode:n,typeScriptCode:o,tokensStr:i});const s=await ne();Y(s);const a=await le(ie),r=e.displayOptions.compareWithBabel?await le(se):null,l=e.displayOptions.compareWithTypeScript?await le(ae):null;J({sucraseTimeMs:a,babelTimeMs:r,typeScriptTimeMs:l})}catch(e){if(e.message!==P&&e.message!==W)throw e;e.message===W&&J({sucraseCode:"Operation timed out after 10 seconds.",babelCode:"Operation timed out after 10 seconds.",typeScriptCode:"Operation timed out after 10 seconds."})}}}();class ce extends a.Component{constructor(e){super(e),ce.prototype.__init.call(this),this.state={code:l,displayOptions:p,sucraseOptions:d,sucraseCode:"",sucraseTimeMs:null,babelCode:"",babelTimeMs:null,typeScriptCode:"",typeScriptTimeMs:null,tokensStr:"",showMore:!1,babelLoaded:!1,typeScriptLoaded:!1};const t=function(){try{const e=window.location.hash;if(!e.startsWith("#"))return null;const t=e.slice(1).split("&");let n={code:l,sucraseOptions:d,displayOptions:p};for(const e of t){const[t,o]=e.split("=");"selectedTransforms"===t?n=(0,D.Uy)(n,(e=>{e.sucraseOptions.transforms=o.split(",")})):Object.prototype.hasOwnProperty.call(d,t)?n=(0,D.Uy)(n,(e=>{e.sucraseOptions[t]=B(t,decodeURIComponent(o))})):"code"===t?n=(0,D.Uy)(n,(e=>{e.code=decodeURIComponent(o)})):"compressedCode"===t?n=(0,D.Uy)(n,(e=>{var t;e.code=(t=decodeURIComponent(o),String.fromCharCode(...I().unzip(L.b$(t))))})):Object.prototype.hasOwnProperty.call(p,t)&&(n=(0,D.Uy)(n,(e=>{e.displayOptions[t]="true"===o})))}return""===n.code?null:n}catch(e){return console.error("Error when loading hash fragment."),console.error(e),null}}();t&&(this.state={...this.state,...t})}componentDidMount(){!function({updateState:e,handleCompressedCode:t}){J=e,Y=t}({updateState:e=>{this.setState((t=>({...t,...e})))},handleCompressedCode:e=>{!function({code:e,compressedCode:t,sucraseOptions:n,displayOptions:o}){const i=[];for(const[e,t]of Object.entries(d)){const o=n[e];if(JSON.stringify(o)!==JSON.stringify(t)){const t=String(o);i.push(`${e}=${encodeURIComponent(t)}`)}}for(const[e,t]of Object.entries(p)){const n=o[e];n!==t&&i.push(`${e}=${n}`)}e!==l&&(e.length>150?i.push(`compressedCode=${encodeURIComponent(t)}`):i.push(`code=${encodeURIComponent(e)}`)),i.length>0?window.location.hash=i.join("&"):window.history.replaceState("",document.title,window.location.pathname+window.location.search)}({code:this.state.code,compressedCode:e,sucraseOptions:this.state.sucraseOptions,displayOptions:this.state.displayOptions})}}),this.postConfigToWorker()}componentDidUpdate(e,t){this.state.code===t.code&&this.state.sucraseOptions===t.sucraseOptions&&this.state.displayOptions===t.displayOptions&&this.state.babelLoaded===t.babelLoaded&&this.state.typeScriptLoaded===t.typeScriptLoaded||this.postConfigToWorker()}postConfigToWorker(){var e;this.setState({sucraseTimeMs:"LOADING",babelTimeMs:"LOADING",typeScriptTimeMs:"LOADING"}),e={code:this.state.code,sucraseOptions:this.state.sucraseOptions,displayOptions:this.state.displayOptions},q=e,H&&H()}__init(){this._handleCodeChange=e=>{this.setState({code:e})}}render(){const{sucraseCode:e,sucraseTimeMs:t,babelCode:n,babelTimeMs:i,typeScriptCode:a,typeScriptTimeMs:r,tokensStr:l}=this.state;return(0,o.jsxs)("div",{className:(0,s.iv)(pe.app),children:[(0,o.jsx)("span",{className:(0,s.iv)(pe.title),children:"Sucrase"}),(0,o.jsxs)("span",{className:(0,s.iv)(pe.subtitle),children:[(0,o.jsx)("span",{children:"Super-fast Babel alternative"})," | ",(0,o.jsx)("a",{className:(0,s.iv)(pe.link),href:"https://github.com/alangpierce/sucrase",children:"GitHub"})]}),(0,o.jsxs)("div",{className:(0,s.iv)(pe.options),children:[(0,o.jsx)(M,{options:this.state.sucraseOptions,onUpdateOptions:e=>{this.setState({sucraseOptions:e})}}),(0,o.jsx)(y,{displayOptions:this.state.displayOptions,onUpdateDisplayOptions:e=>{this.setState({displayOptions:e})}})]}),(0,o.jsxs)("div",{className:(0,s.iv)(pe.editors),children:[(0,o.jsx)(O,{label:"Your code",code:this.state.code,onChange:this._handleCodeChange,babelLoaded:this.state.babelLoaded}),(0,o.jsx)(O,{label:"Transformed with Sucrase",code:e,timeMs:t,isReadOnly:!0,babelLoaded:this.state.babelLoaded}),this.state.displayOptions.compareWithBabel&&(0,o.jsx)(O,{label:"Transformed with Babel",code:n,timeMs:i,isReadOnly:!0,babelLoaded:this.state.babelLoaded}),this.state.displayOptions.compareWithTypeScript&&(0,o.jsx)(O,{label:"Transformed with TypeScript",code:a,timeMs:r,isReadOnly:!0,babelLoaded:this.state.babelLoaded}),this.state.displayOptions.showTokens&&(0,o.jsx)(O,{label:"Tokens",code:l,isReadOnly:!0,isPlaintext:!0,options:{lineNumbers:e=>e>1?String(e-2):""},babelLoaded:this.state.babelLoaded})]}),(0,o.jsxs)("span",{className:(0,s.iv)(pe.footer),children:[(0,o.jsx)("a",{className:(0,s.iv)(pe.link),href:"https://www.npmjs.com/package/sucrase",children:"sucrase"})," ","3.28.0"]})]})}}const de=(0,r.w)(ce),pe=s.mM.create({app:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",backgroundColor:"#222"},title:{fontSize:"2em",color:"white",fontWeight:"bold",padding:8},subtitle:{fontSize:"1.2em",color:"white"},link:{color:"#CCCCCC"},options:{textAlign:"center",color:"white"},footer:{fontSize:"large",color:"white",marginBottom:8},editors:{flex:1,display:"flex",flexDirection:"row",alignItems:"center",width:"100%"}});n(98548),i.render((0,o.jsx)(de,{}),document.getElementById("root"))},51424:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>r});var o=n(94015),i=n.n(o),s=n(23645),a=n.n(s)()(i());a.push([e.id,"body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n","",{version:3,sources:["webpack://./src/index.css"],names:[],mappings:"AAAA;EACE,SAAS;EACT,UAAU;EACV,uBAAuB;AACzB",sourcesContent:["body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n"],sourceRoot:""}]);const r=a},98548:(e,t,n)=>{var o=n(93379),i=n(51424);"string"==typeof(i=i.__esModule?i.default:i)&&(i=[[e.id,i,""]]);o(i,{insert:"head",singleton:!1}),e.exports=i.locals||{}}},i={};function s(e){var t=i[e];if(void 0!==t)return t.exports;var n=i[e]={id:e,exports:{}};return o[e](n,n.exports,s),n.exports}s.m=o,s.amdO={},e=[],s.O=(t,n,o,i)=>{if(!n){var a=1/0;for(d=0;d<e.length;d++){for(var[n,o,i]=e[d],r=!0,l=0;l<n.length;l++)(!1&i||a>=i)&&Object.keys(s.O).every((e=>s.O[e](n[l])))?n.splice(l--,1):(r=!1,i<a&&(a=i));if(r){e.splice(d--,1);var c=o();void 0!==c&&(t=c)}}return t}i=i||0;for(var d=e.length;d>0&&e[d-1][2]>i;d--)e[d]=e[d-1];e[d]=[n,o,i]},s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var n in t)s.o(t,n)&&!s.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},s.f={},s.e=e=>Promise.all(Object.keys(s.f).reduce(((t,n)=>(s.f[n](e,t),t)),[])),s.u=e=>e+"."+s.h().slice(0,8)+".chunk.js",s.h=()=>"67ddc6b75502a6277a28",s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),t={},n="sucrase-website:",s.l=(e,o,i,a)=>{if(t[e])t[e].push(o);else{var r,l;if(void 0!==i)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var p=c[d];if(p.getAttribute("src")==e||p.getAttribute("data-webpack")==n+i){r=p;break}}r||(l=!0,(r=document.createElement("script")).charset="utf-8",r.timeout=120,s.nc&&r.setAttribute("nonce",s.nc),r.setAttribute("data-webpack",n+i),r.src=e),t[e]=[o];var u=(n,o)=>{r.onerror=r.onload=null,clearTimeout(h);var i=t[e];if(delete t[e],r.parentNode&&r.parentNode.removeChild(r),i&&i.forEach((e=>e(o))),n)return n(o)},h=setTimeout(u.bind(null,void 0,{type:"timeout",target:r}),12e4);r.onerror=u.bind(null,r.onerror),r.onload=u.bind(null,r.onload),l&&document.head.appendChild(r)}},s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.p="/",(()=>{s.b=document.baseURI||self.location.href;var e={179:0};s.f.j=(t,n)=>{var o=s.o(e,t)?e[t]:void 0;if(0!==o)if(o)n.push(o[2]);else{var i=new Promise(((n,i)=>o=e[t]=[n,i]));n.push(o[2]=i);var a=s.p+s.u(t),r=new Error;s.l(a,(n=>{if(s.o(e,t)&&(0!==(o=e[t])&&(e[t]=void 0),o)){var i=n&&("load"===n.type?"missing":n.type),a=n&&n.target&&n.target.src;r.message="Loading chunk "+t+" failed.\n("+i+": "+a+")",r.name="ChunkLoadError",r.type=i,r.request=a,o[1](r)}}),"chunk-"+t,t)}},s.O.j=t=>0===e[t];var t=(t,n)=>{var o,i,[a,r,l]=n,c=0;if(a.some((t=>0!==e[t]))){for(o in r)s.o(r,o)&&(s.m[o]=r[o]);if(l)var d=l(s)}for(t&&t(n);c<a.length;c++)i=a[c],s.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return s.O(d)},n=("undefined"!=typeof self?self:this).webpackChunksucrase_website=("undefined"!=typeof self?self:this).webpackChunksucrase_website||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),s.nc=void 0;var a=s.O(void 0,[448],(()=>s(27336)));a=s.O(a)})();
//# sourceMappingURL=main.67ddc6b7.js.map