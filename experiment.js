const VIEWING_DURATION_MS = 30000;
const PAINTING_SRC = "assets/young-italian-woman-puck.jpg";
const PAINTING_ALT = "Young Italian Woman with Her Dog Puck by Thérèse Schwartze (1879)";

const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionSaccade,
      params: {
        mode: "auto",
        smoothing_frames: 3,
      },
    },
  ],
});

const timeline = [
  // 1. Webcam permission, model download, and face alignment
  {
    type: jsPsychSaccadePreview,
  },

  // 2. 13-point calibration so SaccadeJS can estimate gaze coordinates
  {
    type: jsPsychSaccadeCalibrate,
  },

  // 3. Blank page with only the "I’m ready!" button
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: ["I’m ready!"],
    button_html: (choice) => `<button class="ready-btn">${choice}</button>`,
    on_load: () => {
      const content = document.getElementById("jspsych-content");
      if (content) content.classList.add("ready-screen");
    },
    on_finish: () => {
      const content = document.getElementById("jspsych-content");
      if (content) content.classList.remove("ready-screen");
    },
  },

  // 4. Show the painting for 30 seconds while tracking gaze
  {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="painting-stage">
        <img id="painting" class="painting-img" src="${PAINTING_SRC}" alt="${PAINTING_ALT}" />
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: VIEWING_DURATION_MS,
    extensions: [
      {
        type: jsPsychExtensionSaccade,
        params: {
          targets: ["#painting"],
        },
      },
    ],
    data: {
      task: "painting_viewing",
    },
  },

  // 5. If running in deferred mode on a slower laptop, wait for background gaze processing
  {
    type: jsPsychSaccadeCatchUp,
  },

  // 6. Replay the recorded eye traces over the painting
  {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="painting-stage painting-stage--replay">
        <img id="replay-painting" class="painting-img" src="${PAINTING_SRC}" alt="${PAINTING_ALT}" />
      </div>
      <canvas id="trace-canvas"></canvas>
      <div class="replay-controls">
        <button id="btn-play-pause" class="primary">Pause</button>
        <button id="btn-restart">Replay</button>
        <button id="btn-speed">1×</button>
        <input id="replay-scrubber" class="replay-scrubber" type="range" min="0" max="${VIEWING_DURATION_MS}" value="0" step="16" />
        <span id="replay-time" class="replay-time">0.0s / 30.0s</span>
        <button id="btn-show-all">Show Full Trace</button>
        <button id="btn-download">Download JSON</button>
        <span id="replay-meta" class="replay-meta"></span>
      </div>
    `,
    choices: "NO_KEYS",
    on_load: () => {
      const viewingTrial = jsPsych.data.get().filter({ task: "painting_viewing" }).values()[0];
      const rawSamples = Array.isArray(viewingTrial?.saccade_data) ? viewingTrial.saccade_data : [];
      const origBox = viewingTrial?.saccade_targets?.["#painting"] || null;

      const img = document.getElementById("replay-painting");
      const canvas = document.getElementById("trace-canvas");
      const ctx = canvas.getContext("2d");

      const btnPlayPause = document.getElementById("btn-play-pause");
      const btnRestart = document.getElementById("btn-restart");
      const btnSpeed = document.getElementById("btn-speed");
      const btnShowAll = document.getElementById("btn-show-all");
      const btnDownload = document.getElementById("btn-download");
      const scrubber = document.getElementById("replay-scrubber");
      const timeLabel = document.getElementById("replay-time");
      const metaLabel = document.getElementById("replay-meta");

      // Normalize timestamps relative to trial start (0 .. VIEWING_DURATION_MS)
      const samples = rawSamples
        .map((s) => ({
          x: s.x,
          y: s.y,
          t: Math.max(0, Math.min(VIEWING_DURATION_MS, s.t)),
        }))
        .sort((a, b) => a.t - b.t);

      metaLabel.textContent = `${samples.length} samples`;

      let playing = true;
      let showFullTrace = false;
      let speed = 1;
      let playheadMs = 0;
      let lastFrameTs = performance.now();

      function mapPoint(sample) {
        const curBox = img.getBoundingClientRect();
        if (origBox && origBox.width > 0 && origBox.height > 0 && curBox.width > 0 && curBox.height > 0) {
          const nx = (sample.x - origBox.left) / origBox.width;
          const ny = (sample.y - origBox.top) / origBox.height;
          return {
            x: curBox.left + nx * curBox.width,
            y: curBox.top + ny * curBox.height,
          };
        }
        return { x: sample.x, y: sample.y };
      }

      function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { w, h };
      }

      function drawTrace(nowMs) {
        const { w, h } = resizeCanvas();
        ctx.clearRect(0, 0, w, h);

        if (samples.length === 0) {
          ctx.fillStyle = "rgba(24, 24, 27, 0.82)";
          ctx.fillRect(w / 2 - 200, 24, 400, 44);
          ctx.fillStyle = "#fca5a5";
          ctx.font = "600 14px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("No gaze samples were recorded during the 30s viewing.", w / 2, 46);
          return;
        }

        const cutoff = showFullTrace ? VIEWING_DURATION_MS : nowMs;
        const visible = [];
        for (let i = 0; i < samples.length; i++) {
          if (samples[i].t <= cutoff) {
            visible.push({ ...mapPoint(samples[i]), t: samples[i].t });
          } else {
            break;
          }
        }

        if (visible.length === 0) return;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // 1. Subtle persistent scanpath
        ctx.beginPath();
        ctx.moveTo(visible[0].x, visible[0].y);
        for (let i = 1; i < visible.length; i++) {
          ctx.lineTo(visible[i].x, visible[i].y);
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = showFullTrace ? "rgba(16, 185, 129, 0.65)" : "rgba(255, 255, 255, 0.35)";
        ctx.stroke();

        // 2. Highlighted recent trail (last 1.5s of playback)
        if (!showFullTrace) {
          const trailWindowMs = 1500;
          for (let i = 1; i < visible.length; i++) {
            const age = (nowMs - visible[i].t) / trailWindowMs;
            if (age < 0 || age > 1) continue;
            ctx.beginPath();
            ctx.moveTo(visible[i - 1].x, visible[i - 1].y);
            ctx.lineTo(visible[i].x, visible[i].y);
            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.9 * (1 - age)})`;
            ctx.stroke();
          }
        }

        // 3. Current gaze point
        const head = visible[visible.length - 1];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(head.x, head.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }

      function tick(now) {
        const dt = now - lastFrameTs;
        lastFrameTs = now;

        if (playing && !showFullTrace) {
          playheadMs += dt * speed;
          if (playheadMs >= VIEWING_DURATION_MS) {
            playheadMs = VIEWING_DURATION_MS;
            playing = false;
            btnPlayPause.textContent = "Play";
          }
          scrubber.value = String(Math.round(playheadMs));
        }

        const displayMs = showFullTrace ? VIEWING_DURATION_MS : playheadMs;
        timeLabel.textContent = `${(displayMs / 1000).toFixed(1)}s / ${(VIEWING_DURATION_MS / 1000).toFixed(1)}s`;
        drawTrace(playheadMs);
        requestAnimationFrame(tick);
      }

      btnPlayPause.addEventListener("click", () => {
        if (showFullTrace) {
          showFullTrace = false;
          btnShowAll.textContent = "Show Full Trace";
        }
        if (playheadMs >= VIEWING_DURATION_MS) {
          playheadMs = 0;
        }
        playing = !playing;
        btnPlayPause.textContent = playing ? "Pause" : "Play";
      });

      btnRestart.addEventListener("click", () => {
        showFullTrace = false;
        btnShowAll.textContent = "Show Full Trace";
        playheadMs = 0;
        playing = true;
        btnPlayPause.textContent = "Pause";
      });

      btnSpeed.addEventListener("click", () => {
        speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
        btnSpeed.textContent = `${speed}×`;
      });

      btnShowAll.addEventListener("click", () => {
        showFullTrace = !showFullTrace;
        if (showFullTrace) {
          playing = false;
          btnPlayPause.textContent = "Play";
          btnShowAll.textContent = "Animate";
        } else {
          btnShowAll.textContent = "Show Full Trace";
        }
      });

      scrubber.addEventListener("input", (e) => {
        showFullTrace = false;
        btnShowAll.textContent = "Show Full Trace";
        playheadMs = Number(e.target.value);
        playing = false;
        btnPlayPause.textContent = "Play";
      });

      btnDownload.addEventListener("click", () => {
        const payload = {
          painting: PAINTING_ALT,
          duration_ms: VIEWING_DURATION_MS,
          target_rect: origBox,
          timing: viewingTrial?.saccade_timing ?? null,
          samples,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "eye-trace-puck.json";
        a.click();
        URL.revokeObjectURL(url);
      });

      requestAnimationFrame(tick);
    },
  },
];

jsPsych.run(timeline);
