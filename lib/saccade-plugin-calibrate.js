var jsPsychSaccadeCalibrate=(function(i){"use strict";var N="1.0.0";const b="saccade-target-style",$=`
.saccade-target-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  background: #111;
  overflow: hidden;
  cursor: default;
}
.saccade-target {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  display: none;
}
.saccade-target.saccade-visible { display: block; }
.saccade-target.saccade-clickable { pointer-events: auto; cursor: pointer; }
.saccade-target-dot {
  position: absolute;
  border-radius: 50%;
  background: #fff;
}
.saccade-target-ring {
  position: absolute;
  box-sizing: border-box;
  border-radius: 50%;
  border: 3px solid #38bdf8;
  opacity: 0.9;
}
.saccade-target.saccade-settle .saccade-target-ring {
  animation: saccade-target-shrink var(--saccade-settle, 1000ms) linear forwards;
}
.saccade-target.saccade-capture .saccade-target-ring {
  transform: scale(0.25);
  border-color: #4ade80;
}
@keyframes saccade-target-shrink {
  from { transform: scale(1); }
  to { transform: scale(0.25); }
}
.saccade-target-message {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #eee;
  font: 15px/1.5 system-ui, sans-serif;
  text-align: center;
  max-width: 640px;
}
`;class k{constructor(t,e){I(),this.overlay=document.createElement("div"),this.overlay.className="saccade-target-overlay",this.target=document.createElement("div"),this.target.className="saccade-target";const a=e*4;this.ring=document.createElement("div"),this.ring.className="saccade-target-ring",this.ring.style.width=`${a}px`,this.ring.style.height=`${a}px`,this.ring.style.left=`${-a/2}px`,this.ring.style.top=`${-a/2}px`,this.dot=document.createElement("div"),this.dot.className="saccade-target-dot",this.dot.style.width=`${e}px`,this.dot.style.height=`${e}px`,this.dot.style.left=`${-e/2}px`,this.dot.style.top=`${-e/2}px`,this.target.append(this.ring,this.dot),this.overlay.append(this.target),t.append(this.overlay)}get element(){return this.target}moveTo(t,e){this.target.style.left=t,this.target.style.top=e,this.target.classList.add("saccade-visible")}setPhase(t,e=1e3){this.target.classList.remove("saccade-settle","saccade-capture"),this.target.style.setProperty("--saccade-settle",`${e}ms`),this.target.offsetWidth,t==="settle"&&this.target.classList.add("saccade-settle"),t==="capture"&&this.target.classList.add("saccade-capture")}setClickable(t){this.target.classList.toggle("saccade-clickable",t)}hide(){this.target.classList.remove("saccade-visible","saccade-settle","saccade-capture")}showMessage(t){this.overlay.innerHTML=`<div class="saccade-target-message">${t}</div>`}showFailure(t,e="Continue"){return this.showMessage(`<p>${v(t)}</p><p><button id="saccade-target-continue" class="jspsych-btn">${v(e)}</button></p>`),new Promise(a=>{this.overlay.querySelector("#saccade-target-continue").addEventListener("click",()=>a())})}destroy(){this.overlay.remove()}}function v(n){return n.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function I(){if(document.getElementById(b))return;const n=document.createElement("style");n.id=b,n.textContent=$,document.head.appendChild(n)}var L=(n,t,e)=>new Promise((a,g)=>{var s=c=>{try{l(e.next(c))}catch(u){g(u)}},p=c=>{try{l(e.throw(c))}catch(u){g(u)}},l=c=>c.done?a(c.value):Promise.resolve(c.value).then(s,p);l((e=e.apply(n,t)).next())});const M=[[5,5],[50,5],[95,5],[5,50],[50,50],[95,50],[5,95],[50,95],[95,95],[27.5,27.5],[72.5,27.5],[27.5,72.5],[72.5,72.5]],E={name:"saccade-calibrate",version:N,parameters:{calibration_points:{type:i.ParameterType.INT,default:M,array:!0},calibration_mode:{type:i.ParameterType.SELECT,options:["view","click"],default:"view"},repetitions_per_point:{type:i.ParameterType.INT,default:1},randomize_calibration_order:{type:i.ParameterType.BOOL,default:!1},time_to_saccade:{type:i.ParameterType.INT,default:1e3},time_per_point:{type:i.ParameterType.INT,default:500},point_size:{type:i.ParameterType.INT,default:20},lambda:{type:i.ParameterType.FLOAT,default:null},fit:{type:i.ParameterType.STRING,default:null},clear_previous:{type:i.ParameterType.BOOL,default:!0},processing_message:{type:i.ParameterType.HTML_STRING,default:"<p>Processing. This can take a few seconds.</p>"}},data:{calibration_points_px:{type:i.ParameterType.INT,array:!0},n_points:{type:i.ParameterType.INT},repetitions_per_point:{type:i.ParameterType.INT},lambda:{type:i.ParameterType.FLOAT},weighting:{type:i.ParameterType.STRING},fit:{type:i.ParameterType.STRING},processing_ms:{type:i.ParameterType.INT},rt:{type:i.ParameterType.INT}},citations:{apa:"",bibtex:""}};class T{constructor(t){this.jsPsych=t}trial(t,e){const a=this.jsPsych.extensions.saccade;if(!a)throw new Error("The saccade-calibrate plugin requires the saccade extension. Add it to initJsPsych: initJsPsych({ extensions: [{ type: jsPsychExtensionSaccade }] })");const g=performance.now(),s=new k(t,e.point_size),p=[];let l=null;const c=r=>new Promise(o=>this.jsPsych.pluginAPI.setTimeout(o,r)),u=()=>new Promise(r=>{const o=()=>{s.element.removeEventListener("click",o),r()};s.element.addEventListener("click",o)}),P=r=>{s.destroy(),a.hidePredictions(),t.innerHTML="";const o=new Set(p.map(m=>`${m[0]},${m[1]}`));this.jsPsych.finishTrial({calibration_points_px:p,n_points:o.size,repetitions_per_point:e.repetitions_per_point,lambda:r?r.lambda:null,weighting:r?r.weighting:null,fit:r?r.fit:null,processing_ms:l,rt:Math.round(performance.now()-g)})};L(this,null,function*(){var r,o,m;e.clear_previous&&a.resetCalibration(),a.hidePredictions(),a.resume();const _=e.calibration_mode==="click";s.setClickable(_);for(let y=0;y<e.repetitions_per_point;y++){const h=e.calibration_points,f=e.randomize_calibration_order?this.jsPsych.randomization.shuffle(h):h;for(const d of f){const w=d[0]/100*C(),x=d[1]/100*S();p.push([Math.round(w),Math.round(x)]),s.moveTo(`${d[0]}%`,`${d[1]}%`),_?(s.setPhase("idle"),yield u()):(s.setPhase("settle",e.time_to_saccade),yield c(e.time_to_saccade)),s.setPhase("capture"),yield a.calibratePoint(w,x,{captureMs:e.time_per_point})}}if(s.hide(),((r=a.getMode)==null?void 0:r.call(a))==="deferred"){const y=performance.now(),h=Math.max(1,a.getDeferredPending()),f=d=>s.showMessage(`${e.processing_message}<p>${Math.round(100*Math.max(0,1-d/h))}%</p>`);f(h),yield a.finishCalibration(f),l=Math.round(performance.now()-y)}return a.fitCalibration((o=e.lambda)!=null?o:void 0,(m=e.fit)!=null?m:void 0)}).then(P,r=>{var o;console.error(r),s.hide(),s.showFailure(`Calibration could not finish: ${String((o=r==null?void 0:r.message)!=null?o:r)}. Check that nothing else is using your camera, then continue.`).then(()=>P(null))})}}T.info=E;function C(){return window.innerWidth||document.documentElement.clientWidth||1}function S(){return window.innerHeight||document.documentElement.clientHeight||1}return T})(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@saccadejs/plugin-calibrate@1.0.0/dist/index.browser.min.js.map
