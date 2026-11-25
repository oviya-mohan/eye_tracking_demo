# Eye-Tracking Art Viewing Experiment (`saccade.js`)

A minimal browser-based webcam eye-tracking experiment using [SaccadeJS](https://saccade.jspsych.org/) (`@saccadejs/core`, `@saccadejs/extension`, `@saccadejs/plugin-preview`, `@saccadejs/plugin-calibrate`, `@saccadejs/plugin-catch-up`) and [jsPsych](https://www.jspsych.org/).

## Flow

1. **Camera & Calibration**: Grants webcam access, loads the SaccadeJS eye model locally in the browser, and runs a 13-point calibration.
2. **Ready Screen**: Displays a blank page with a single **“I’m ready!”** button.
3. **30-Second Viewing**: Displays *Young Italian Woman with the Dog Puck* (Thérèse Schwartze, 1879) for 30 seconds while recording gaze coordinates.
4. **Eye Trace Playback**: Replays the recorded gaze scanpath over the painting with play/pause, speed (`1×` / `2×` / `4×`), timeline scrubbing, full-trace toggle, and JSON export.

All webcam processing runs locally in the participant's browser; no video or gaze data is uploaded to any server.

## Run Locally

Browsers require `https://` or `localhost` for webcam access. Serve the repository root with any static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in Chrome or Edge.

## Artwork Credit

- *Young Italian woman with the dog Puck* (*Jonge Italiaanse vrouw met de hond Puck*), Thérèse Schwartze, 1879, Rijksmuseum Amsterdam (`SK-A-1703`). Public domain via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jonge_Italiaanse_vrouw_met_de_hond_Puck_Rijksmuseum_SK-A-1703.jpeg).
