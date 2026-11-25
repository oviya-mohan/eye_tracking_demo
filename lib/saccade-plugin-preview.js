var jsPsychSaccadePreview=(function(r){"use strict";var ee="1.0.0";const S=[{stage:"camera",label:"Waiting for permission to use your camera",weight:1},{stage:"mediapipe",label:"Loading",weight:2},{stage:"landmarker",label:"Loading",weight:3},{stage:"ort",label:"Loading",weight:2},{stage:"model",label:"Downloading the eye tracker",weight:10},{stage:"session",label:"Almost ready",weight:2},{stage:"deferred",label:"Your computer needs a little longer to get ready",weight:2}],A=S.reduce((a,e)=>a+e.weight,0),$=a=>(a/1e6).toFixed(1);function ae(a){if(!a)return 0;if(a.stage==="ready")return 1;let e=0;for(const t of S){if(t.stage===a.stage){const s=a.total&&a.loaded!=null?Math.min(1,a.loaded/a.total):0;return(e+t.weight*s)/A}e+=t.weight}return e/A}function te(a){var e,t;if(!a)return"Starting\u2026";if(a.stage==="ready")return"Ready";const s=(t=(e=S.find(n=>n.stage===a.stage))==null?void 0:e.label)!=null?t:"Loading";return a.stage!=="model"||a.loaded==null?`${s}\u2026`:a.total?`${s} (${$(a.loaded)} of ${$(a.total)} MB)\u2026`:`${s} (${$(a.loaded)} MB)\u2026`}class re{constructor(e){this.thresholds=e,this.iod=[],this.contrast=[],this.brightness=[],this.distance=null,this.lighting=null}update(e){e&&(F(this.iod,e.interocularDistance),F(this.contrast,e.eyeContrast),F(this.brightness,e.eyeBrightness),this.distance=this.distanceStatus(this.interocularDistance),this.lighting=this.lightingStatus(this.eyeContrast,this.eyeBrightness))}get interocularDistance(){return M(this.iod)}get eyeContrast(){return M(this.contrast)}get eyeBrightness(){return M(this.brightness)}distanceStatus(e){const{minInterocularDistance:t,maxInterocularDistance:s}=this.thresholds,n=this.distance,x=n==="closer"?t*(1+.05):t,I=n==="farther"?s*(1-.05):s;return e<x?"closer":e>I?"farther":"good"}lightingStatus(e,t){const s=this.thresholds.minEyeContrast,n=this.lighting!==null&&this.lighting!=="good";return e>=(n?s*1.05:s)?"good":t<45?"dark":t>170?"bright":"flat"}}function F(a,e){Number.isFinite(e)&&(a.push(e),a.length>10&&a.shift())}function M(a){if(!a.length)return null;let e=0;for(const t of a)e+=t;return e/a.length}function N(a){switch(a){case"good":return"Distance: good";case"closer":return"Distance: move a little closer to the camera";case"farther":return"Distance: move back a little";default:return"Distance: checking\u2026"}}function E(a){switch(a){case"good":return"Lighting: good";case"dark":return"Lighting: too dark. Add light in front of you, such as a lamp or a window";case"bright":return"Lighting: too bright. Move out of any strong light shining on your face";case"flat":return"Lighting: your eyes are hard to make out. Face a lamp or window, with no bright light behind you";default:return"Lighting: checking\u2026"}}var ne=Math.pow;const v=144,b=36,z="saccade-preview-style",ie="Face found",R="Looking for your face\u2026",ce=`
#saccade-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 16px;
  font-family: inherit;
}
#saccade-preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
#saccade-preview-video {
  display: block;
  transform: scaleX(-1);
  background: #000;
  border-radius: 6px;
}
#saccade-preview-crop {
  display: block;
  image-rendering: pixelated;
  background: #000;
  border-radius: 4px;
}
#saccade-preview-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
#saccade-preview-face {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}
#saccade-preview-face::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
}
#saccade-preview-face.saccade-face-yes { color: #16a34a; }
#saccade-preview-face.saccade-face-no { color: #d97706; }
#saccade-preview-feedback {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: 14px;
}
.saccade-feedback-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.saccade-feedback-item::before {
  content: "";
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.saccade-feedback-item.saccade-feedback-good { color: #16a34a; }
.saccade-feedback-item.saccade-feedback-bad { color: #d97706; }
.saccade-feedback-item.saccade-feedback-none { opacity: 0.5; }
#saccade-preview-diagnostics {
  display: flex;
  gap: 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  opacity: 0.7;
}
#saccade-preview-instructions { max-width: 640px; }
#saccade-preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 16px;
  font-family: inherit;
}
#saccade-preview-progress-track {
  width: min(420px, 80vw);
  height: 8px;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.3);
  overflow: hidden;
}
#saccade-preview-progress-bar {
  height: 100%;
  width: 0%;
  border-radius: 4px;
  background: #38bdf8;
  transition: width 150ms linear;
}
#saccade-preview-progress-label { font-size: 14px; }
#saccade-preview-loading-note { font-size: 13px; opacity: 0.75; max-width: 420px; text-align: center; }
.saccade-preview-detail {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  opacity: 0.75;
}
`,se={name:"saccade-preview",version:ee,parameters:{instructions:{type:r.ParameterType.HTML_STRING,default:`
        <p>Position your head so that the webcam has a good view of your eyes.</p>
        <p>Look directly at the screen and keep your face centered in the preview. It is important
        that you keep your head reasonably still for the rest of the experiment, so take a moment
        now to make your setup comfortable.</p>
        <p>When the preview says <strong>Face found</strong>, you can continue.</p>`},button_text:{type:r.ParameterType.STRING,default:"Continue"},show_eye_crop:{type:r.ParameterType.BOOL,default:!0},require_face:{type:r.ParameterType.BOOL,default:!0},face_timeout:{type:r.ParameterType.INT,default:null},show_setup_feedback:{type:r.ParameterType.BOOL,default:!0},min_interocular_distance:{type:r.ParameterType.FLOAT,default:.14},max_interocular_distance:{type:r.ParameterType.FLOAT,default:.32},min_eye_contrast:{type:r.ParameterType.FLOAT,default:17},preview_width:{type:r.ParameterType.INT,default:320},show_progress:{type:r.ParameterType.BOOL,default:!0},show_diagnostics:{type:r.ParameterType.BOOL,default:!1}},data:{load_time:{type:r.ParameterType.INT},face_detected:{type:r.ParameterType.BOOL},fps:{type:r.ParameterType.FLOAT},backend:{type:r.ParameterType.STRING},interocular_distance:{type:r.ParameterType.FLOAT},eye_contrast:{type:r.ParameterType.FLOAT},eye_brightness:{type:r.ParameterType.FLOAT},distance_feedback:{type:r.ParameterType.STRING},lighting_feedback:{type:r.ParameterType.STRING},rt:{type:r.ParameterType.INT}},citations:{apa:"",bibtex:""}};class G{constructor(e){this.jsPsych=e}trial(e,t,s){const n=this.jsPsych.extensions.saccade;if(!n)throw new Error("The saccade-preview plugin requires the saccade extension. Add it to initJsPsych: initJsPsych({ extensions: [{ type: jsPsychExtensionSaccade }] })");let x;const I=performance.now();let W=null,O=null,k=null,o=null,J=!1,U=null,V=!1;const l=new re({minInterocularDistance:t.min_interocular_distance,maxInterocularDistance:t.max_interocular_distance,minEyeContrast:t.min_eye_contrast});de(),(()=>{var i,d;if(!t.show_progress){e.innerHTML='<p id="saccade-preview-loading">Starting the camera\u2026</p>';return}e.innerHTML=`
        <div id="saccade-preview-loading">
          <div id="saccade-preview-progress-track" role="progressbar" aria-valuemin="0"
            aria-valuemax="100" aria-valuenow="0">
            <div id="saccade-preview-progress-bar"></div>
          </div>
          <p id="saccade-preview-progress-label">Starting\u2026</p>
          <p id="saccade-preview-loading-note">This can take a minute on a slow connection. It
          only needs to download once.</p>
        </div>`;const f=e.querySelector("#saccade-preview-progress-track"),m=e.querySelector("#saccade-preview-progress-bar"),u=e.querySelector("#saccade-preview-progress-label");let w=0;const p=h=>{if(!m.isConnected)return;w=Math.max(w,Math.round(Math.min(1,Math.max(0,ae(h)))*100));const y=w;m.style.width=`${y}%`,f.setAttribute("aria-valuenow",String(y)),u.textContent=te(h)};o=(d=(i=n.onSetupProgress)==null?void 0:i.call(n,p))!=null?d:null,o||p(null)})();const le=()=>{k==null||k(),k=null,o==null||o(),o=null;const i=n.getTracker().video;i&&(i.removeAttribute("id"),i.style.width="",i.style.height=""),n.hideVideo(),n.pause();const d={load_time:W,face_detected:J,fps:U,backend:n.getBackend(),interocular_distance:C(l.interocularDistance,4),eye_contrast:C(l.eyeContrast,2),eye_brightness:C(l.eyeBrightness,2),distance_feedback:l.distance,lighting_feedback:l.lighting,rt:O===null?null:Math.round(performance.now()-O)};e.innerHTML="",this.jsPsych.finishTrial(d),x()},ue=()=>{var i,d;W=Math.round(performance.now()-I),O=performance.now();const f=t.show_eye_crop?`width:${t.preview_width}px; height:${Math.round(t.preview_width*b/v)}px;`:"display:none;";e.innerHTML=`
        <div id="saccade-preview-wrapper">
          <div id="saccade-preview-panel">
            <canvas id="saccade-preview-crop" width="${v}" height="${b}"
              style="${f}"></canvas>
            <div id="saccade-preview-status" aria-live="polite">
              <span id="saccade-preview-face" class="saccade-face-no">${R}</span>
              ${t.show_setup_feedback?`<span id="saccade-preview-feedback">
                      <span id="saccade-preview-distance" class="saccade-feedback-item
                        saccade-feedback-none">${N(null)}</span>
                      <span id="saccade-preview-lighting" class="saccade-feedback-item
                        saccade-feedback-none">${E(null)}</span>
                    </span>`:""}
              ${t.show_diagnostics?`<span id="saccade-preview-diagnostics">
                      <span id="saccade-preview-fps">\u2013 fps</span>
                      <span id="saccade-preview-backend">${(i=n.getBackend())!=null?i:"\u2013"}</span>
                    </span>`:""}
            </div>
          </div>
          <div id="saccade-preview-instructions">${t.instructions}</div>
          <button id="saccade-preview-continue" class="jspsych-btn">${t.button_text}</button>
        </div>`;const m=e.querySelector("#saccade-preview-panel"),u=n.getTracker().video;u&&(u.id="saccade-preview-video",u.style.width=`${t.preview_width}px`,u.style.height="auto",m.insertBefore(u,m.firstChild));const w=e.querySelector("#saccade-preview-crop"),p=t.show_eye_crop?w.getContext("2d"):null,h=p?p.createImageData(v,b):null,y=e.querySelector("#saccade-preview-face"),q=e.querySelector("#saccade-preview-distance"),B=e.querySelector("#saccade-preview-lighting"),X=e.querySelector("#saccade-preview-fps"),Y=e.querySelector("#saccade-preview-backend"),T=e.querySelector("#saccade-preview-continue");T.disabled=!!t.require_face,T.addEventListener("click",le),t.require_face&&t.face_timeout!==null&&this.jsPsych.pluginAPI.setTimeout(()=>{V=!0,T.disabled=!1},t.face_timeout),Y&&(Y.textContent=(d=n.getBackend())!=null?d:"\u2013");let pe=0,K=!1,Q=null,Z=null;k=n.getTracker().onFrame(c=>{var j;if(J=c.faceFound,U=c.fps,p&&h&&c.crop&&c.crop.length===v*b){const L=h.data;for(let g=0;g<c.crop.length;g++){const D=c.crop[g];L[g*4]=D,L[g*4+1]=D,L[g*4+2]=D,L[g*4+3]=255}p.putImageData(h,0,0)}c.faceFound!==K&&(K=c.faceFound,y.textContent=c.faceFound?ie:R,y.className=c.faceFound?"saccade-face-yes":"saccade-face-no"),t.require_face&&!V&&(T.disabled=!c.faceFound),l.update((j=c.quality)!=null?j:null);const _=c.faceFound?l.distance:null,P=c.faceFound?l.lighting:null;q&&_!==Q&&(Q=_,q.textContent=N(_),q.className=`saccade-feedback-item ${H(_)}`),B&&P!==Z&&(Z=P,B.textContent=E(P),B.className=`saccade-feedback-item ${H(P)}`),X&&pe++%5===0&&(X.textContent=`${c.fps.toFixed(1)} fps`)}),s()};return(n.isInitialized()?Promise.resolve():n.start()).then(()=>{o==null||o(),o=null,n.resume(),ue()}).catch(i=>{var d;o==null||o(),o=null,console.error(i);const f=(i==null?void 0:i.name)==="WebGLUnavailableError"?`<p>This browser has its graphics features (WebGL) turned off or unavailable, and the
               eye tracker needs them. Turning on hardware acceleration in the browser's settings,
               or using a different browser, may help.</p>`:`<p>This usually means the page doesn't have permission to use your camera, or
               another app is using it.</p>`;e.innerHTML=`
          <p>Sorry, the eye tracker couldn't start, so the experiment can't continue.</p>
          ${f}
          <p class="saccade-preview-detail">${oe(String((d=i==null?void 0:i.message)!=null?d:i))}</p>`,s()}),new Promise(i=>{x=i})}}G.info=se;function H(a){return a===null?"saccade-feedback-none":a==="good"?"saccade-feedback-good":"saccade-feedback-bad"}function C(a,e){if(a===null)return null;const t=ne(10,e);return Math.round(a*t)/t}function oe(a){return a.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function de(){if(document.getElementById(z))return;const a=document.createElement("style");a.id=z,a.textContent=ce,document.head.appendChild(a)}return G})(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@saccadejs/plugin-preview@1.0.0/dist/index.browser.min.js.map
