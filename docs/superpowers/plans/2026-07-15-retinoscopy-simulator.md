# 視網膜檢影鏡模擬器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained retinoscopy teaching simulator (explore + test modes, working-distance correction, mouse/touch drag streak sweep, 13 clinical presets, plus/minus cylinder toggle, zh-Hant/zh-Hans UI) that a teacher can double-click open or embed in course materials with zero build step.

**Architecture:** Two small dependency-free vanilla-JS data/logic modules (`optics.js`, `presets.js`) plus an `app.js` wiring layer, unit-testable under Node's built-in test runner. During development they're loaded by `index.html` via relative `<script src>` tags for fast iteration. A final packaging task (`build.js`, a dev-only Node script) inlines all three into `index.html` itself so the **shipped artifact is one true self-contained file** — matching the approved spec's "single HTML file, zero dependency" requirement, which plain `<script src>` loading from `file://` doesn't reliably satisfy across browsers. All rendering is Canvas 2D; all controls are plain HTML inputs/buttons wired with vanilla JS event listeners — no build tools ship with the artifact, no npm packages, no framework.

**Tech Stack:** HTML5 Canvas, vanilla JS (ES5-compatible syntax for maximum embeddability), Node.js built-in test runner (`node --test`) for the logic modules. Reference spec: [docs/superpowers/specs/2026-07-15-retinoscopy-simulator-design.md](../specs/2026-07-15-retinoscopy-simulator-design.md).

---

## Task 1: Optics module — meridian power and working distance

**Files:**
- Create: `tools/retinoscopy-simulator/optics.js`
- Test: `tools/retinoscopy-simulator/optics.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tools/retinoscopy-simulator/optics.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const Optics = require('./optics.js');

test('meridianPower returns sphere only along the axis meridian', () => {
  assert.equal(Optics.meridianPower(0, -2.00, 180, 180), 0);
});

test('meridianPower returns sphere+cylinder 90 degrees from axis', () => {
  assert.equal(Optics.meridianPower(0, -2.00, 180, 90), -2);
});

test('workingDistanceD converts common exam distances to diopters', () => {
  assert.equal(Optics.workingDistanceD(50), 2);
  assert.equal(Optics.workingDistanceD(100), 1);
  assert.ok(Math.abs(Optics.workingDistanceD(67) - 1.4925373134328357) < 1e-9);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: FAIL — `Cannot find module './optics.js'`

- [ ] **Step 3: Create the directory and write the minimal implementation**

Create `tools/retinoscopy-simulator/optics.js`:

```js
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Optics = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function meridianPower(sphere, cylinder, axisDeg, atAngleDeg) {
    var rad = (atAngleDeg - axisDeg) * Math.PI / 180;
    return sphere + cylinder * Math.pow(Math.sin(rad), 2);
  }

  function workingDistanceD(cmDistance) {
    return 100 / cmDistance;
  }

  return {
    meridianPower: meridianPower,
    workingDistanceD: workingDistanceD
  };
}));
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add tools/retinoscopy-simulator/optics.js tools/retinoscopy-simulator/optics.test.js
git commit -m "feat: add meridian power and working distance optics functions"
```

---

## Task 2: Optics module — neutralizing power and reflex comparison

**Files:**
- Modify: `tools/retinoscopy-simulator/optics.js`
- Modify: `tools/retinoscopy-simulator/optics.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tools/retinoscopy-simulator/optics.test.js`:

```js
test('neutralPowerAt adds working distance to sphere before the meridian calc', () => {
  // Worked example from the AAO tutorial: WD 2.00D, neutralizing reading +3.50+0.75x90
  // means patient Rx is +1.50+0.75x90, so neutral power AT the axis meridian (90)
  // must equal the neutralizing sphere alone (3.50), and 90 degrees away must equal 3.50+0.75.
  const atAxis = Optics.neutralPowerAt(1.50, 0.75, 90, 2.00, 90);
  assert.ok(Math.abs(atAxis - 3.50) < 1e-9);

  const perpendicular = Optics.neutralPowerAt(1.50, 0.75, 90, 2.00, 180);
  assert.ok(Math.abs(perpendicular - 4.25) < 1e-9);
});

test('compareReflex reports "with" when more plus power is needed', () => {
  const result = Optics.compareReflex(0.00, 3.50);
  assert.equal(result.state, 'with');
  assert.ok(Math.abs(result.magnitude - 3.50) < 1e-9);
});

test('compareReflex reports "against" when the dialed lens overshoots', () => {
  const result = Optics.compareReflex(-1.00, -3.00);
  assert.equal(result.state, 'against');
  assert.ok(Math.abs(result.magnitude - 2.00) < 1e-9);
});

test('compareReflex reports "neutral" within tolerance', () => {
  const result = Optics.compareReflex(1.50, 1.70, 0.25);
  assert.equal(result.state, 'neutral');
});

test('compareReflex defaults tolerance to 0.25D', () => {
  const justInside = Optics.compareReflex(1.50, 1.74);
  assert.equal(justInside.state, 'neutral');
  const justOutside = Optics.compareReflex(1.50, 1.76);
  assert.equal(justOutside.state, 'with');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: FAIL — `Optics.neutralPowerAt is not a function`

- [ ] **Step 3: Implement the functions**

Modify `tools/retinoscopy-simulator/optics.js` — add these two functions before the final `return` statement, and add them to the returned object:

```js
  function neutralPowerAt(patientSphere, patientCyl, patientAxis, wdD, atAngleDeg) {
    return meridianPower(patientSphere + wdD, patientCyl, patientAxis, atAngleDeg);
  }

  function compareReflex(dialedLensPowerAtAngle, neutralPowerAtAngle, tolerance) {
    tolerance = tolerance === undefined ? 0.25 : tolerance;
    var diff = neutralPowerAtAngle - dialedLensPowerAtAngle;
    var state;
    if (diff > tolerance) {
      state = 'with';
    } else if (diff < -tolerance) {
      state = 'against';
    } else {
      state = 'neutral';
    }
    return { state: state, magnitude: Math.abs(diff) };
  }
```

Update the return statement to:

```js
  return {
    meridianPower: meridianPower,
    workingDistanceD: workingDistanceD,
    neutralPowerAt: neutralPowerAt,
    compareReflex: compareReflex
  };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: PASS (8 tests total)

- [ ] **Step 5: Commit**

```bash
git add tools/retinoscopy-simulator/optics.js tools/retinoscopy-simulator/optics.test.js
git commit -m "feat: add neutralizing power and with/against reflex comparison"
```

---

## Task 3: Optics module — plus/minus cylinder notation toggle

**Files:**
- Modify: `tools/retinoscopy-simulator/optics.js`
- Modify: `tools/retinoscopy-simulator/optics.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tools/retinoscopy-simulator/optics.test.js`:

```js
test('plusCylToMinusCyl toggles cylinder notation', () => {
  const result = Optics.plusCylToMinusCyl(1.50, 0.75, 90);
  assert.ok(Math.abs(result.sphere - 2.25) < 1e-9);
  assert.ok(Math.abs(result.cyl - (-0.75)) < 1e-9);
  assert.equal(result.axis, 180);
});

test('plusCylToMinusCyl is self-inverse (applying it twice restores the original)', () => {
  const once = Optics.plusCylToMinusCyl(1.50, 0.75, 90);
  const twice = Optics.plusCylToMinusCyl(once.sphere, once.cyl, once.axis);
  assert.ok(Math.abs(twice.sphere - 1.50) < 1e-9);
  assert.ok(Math.abs(twice.cyl - 0.75) < 1e-9);
  assert.equal(twice.axis, 90);
});

test('plusCylToMinusCyl normalizes axis into the 0-180 range', () => {
  const result = Optics.plusCylToMinusCyl(0.00, -2.00, 45);
  assert.equal(result.axis, 135);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: FAIL — `Optics.plusCylToMinusCyl is not a function`

- [ ] **Step 3: Implement the function**

Modify `tools/retinoscopy-simulator/optics.js` — add before the final `return` statement:

```js
  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function plusCylToMinusCyl(sphere, cyl, axis) {
    var newSphere = round2(sphere + cyl);
    var newCyl = round2(-cyl);
    var newAxis = axis + 90;
    if (newAxis > 180) newAxis -= 180;
    if (newAxis <= 0) newAxis += 180;
    return { sphere: newSphere, cyl: newCyl, axis: newAxis };
  }
```

Update the return statement to include `plusCylToMinusCyl: plusCylToMinusCyl`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: PASS (11 tests total)

- [ ] **Step 5: Commit**

```bash
git add tools/retinoscopy-simulator/optics.js tools/retinoscopy-simulator/optics.test.js
git commit -m "feat: add plus/minus cylinder notation toggle"
```

---

## Task 4: Presets data module

**Files:**
- Create: `tools/retinoscopy-simulator/presets.js`
- Test: `tools/retinoscopy-simulator/presets.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tools/retinoscopy-simulator/presets.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const presets = require('./presets.js');

test('has exactly 13 presets', () => {
  assert.equal(presets.length, 13);
});

test('preset 1 is emmetropia', () => {
  assert.equal(presets[0].sphere, 0.00);
  assert.equal(presets[0].cyl, 0.00);
});

test('preset 7 matches the spec table: simple myopic astigmatism WTR', () => {
  const p = presets[6];
  assert.equal(p.sphere, 0.00);
  assert.equal(p.cyl, -2.00);
  assert.equal(p.axis, 180);
});

test('preset 12 matches the spec table: mixed astigmatism', () => {
  const p = presets[11];
  assert.equal(p.sphere, 1.00);
  assert.equal(p.cyl, -3.00);
  assert.equal(p.axis, 180);
});

test('preset 13 matches the spec table: very low astigmatism', () => {
  const p = presets[12];
  assert.equal(p.sphere, -0.50);
  assert.equal(p.cyl, -0.25);
  assert.equal(p.axis, 60);
});

test('every preset has a non-empty Traditional Chinese label', () => {
  presets.forEach((p) => {
    assert.ok(typeof p.label === 'string' && p.label.length > 0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: FAIL — `Cannot find module './presets.js'`

- [ ] **Step 3: Write the implementation**

Create `tools/retinoscopy-simulator/presets.js` (values from spec section 7):

```js
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Presets = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    { label: '正視', sphere: 0.00, cyl: 0.00, axis: 180 },
    { label: '輕度單純近視', sphere: -1.50, cyl: 0.00, axis: 180 },
    { label: '中度單純近視', sphere: -4.00, cyl: 0.00, axis: 180 },
    { label: '高度近視', sphere: -8.00, cyl: 0.00, axis: 180 },
    { label: '輕度單純遠視', sphere: 2.00, cyl: 0.00, axis: 180 },
    { label: '高度遠視', sphere: 6.00, cyl: 0.00, axis: 180 },
    { label: '單純近視性散光（順規）', sphere: 0.00, cyl: -2.00, axis: 180 },
    { label: '單純近視性散光（斜軸）', sphere: 0.00, cyl: -1.50, axis: 135 },
    { label: '近視性複合散光（順規）', sphere: -2.00, cyl: -1.50, axis: 180 },
    { label: '近視性複合散光（逆規）', sphere: -1.00, cyl: -2.00, axis: 90 },
    { label: '遠視性複合散光（斜軸）', sphere: 1.50, cyl: -1.00, axis: 45 },
    { label: '混合散光', sphere: 1.00, cyl: -3.00, axis: 180 },
    { label: '極輕度散光（精細判斷測試）', sphere: -0.50, cyl: -0.25, axis: 60 }
  ];
}));
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: PASS (17 tests total across both test files)

- [ ] **Step 5: Commit**

```bash
git add tools/retinoscopy-simulator/presets.js tools/retinoscopy-simulator/presets.test.js
git commit -m "feat: add 13 clinical preset cases"
```

---

## Task 5: Static HTML page skeleton

**Files:**
- Create: `tools/retinoscopy-simulator/index.html`

- [ ] **Step 1: Write the full page skeleton**

Create `tools/retinoscopy-simulator/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>視網膜檢影鏡模擬器</title>
<style>
  :root {
    --panel-bg: #eeeeee;
    --border: #cccccc;
    --accent: #ff6a00;
    --text: #222222;
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
    background: #fafafa;
    color: var(--text);
    margin: 0;
    padding: 16px;
  }
  h1 { font-size: 20px; margin: 0 0 12px; display: inline-block; }
  #langToggle { float: right; font-size: 12px; cursor: pointer; padding: 4px 8px; }
  #presetSelect { width: 100%; max-width: 480px; padding: 6px; font-size: 14px; margin: 12px 0; display: block; }
  .layout { display: flex; gap: 16px; flex-wrap: wrap; max-width: 1000px; }
  .eye-column { flex: 1 1 480px; }
  #eyeCanvas {
    width: 100%; max-width: 480px; height: 270px;
    background: #d8c3a5; border-radius: 8px; display: block;
    touch-action: none; cursor: grab;
  }
  #dragHint { font-size: 12px; color: #888; }
  .side-panel { flex: 1 1 320px; display: flex; flex-direction: column; gap: 12px; }
  .tabs { display: flex; gap: 4px; }
  .tab-button {
    flex: 1; padding: 8px; border: 1px solid var(--border);
    background: var(--panel-bg); cursor: pointer; font-size: 14px;
  }
  .tab-button.active { background: var(--accent); color: white; border-color: var(--accent); }
  .panel { border: 1px solid var(--border); border-radius: 6px; padding: 10px; background: white; }
  .panel h2 { font-size: 14px; margin: 0 0 8px; }
  .field-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .field { flex: 1; }
  .field label { display: block; font-size: 12px; color: #666; margin-bottom: 2px; }
  .field input { width: 100%; padding: 4px; font-size: 14px; }
  .quick-buttons { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
  .quick-buttons button { flex: 1; padding: 4px; font-size: 12px; cursor: pointer; }
  #explorePanel, #refractiveErrorPanel, #testPanel { display: none; }
  #explorePanel.visible, #refractiveErrorPanel.visible, #testPanel.visible { display: block; }
  .answer-feedback { font-size: 13px; margin-top: 6px; min-height: 18px; }
  .answer-feedback.correct { color: #1a7a1a; }
  .answer-feedback.close { color: #b8860b; }
  .answer-feedback.incorrect { color: #c0392b; }
</style>
</head>
<body>
  <button id="langToggle" type="button">繁/简</button>
  <h1 id="pageTitle">視網膜檢影鏡模擬器</h1>

  <select id="presetSelect"></select>

  <div class="layout">
    <div class="eye-column">
      <canvas id="eyeCanvas" width="480" height="270"></canvas>
      <p id="dragHint">在眼睛上按住滑鼠（或手指）拖曳，模擬掃描光帶</p>
    </div>

    <div class="side-panel">
      <div class="tabs">
        <button class="tab-button active" id="exploreTabBtn" type="button">explore</button>
        <button class="tab-button" id="testTabBtn" type="button">test</button>
      </div>

      <div class="panel" id="explorePanel">
        <h2 id="explorePanelTitle">病人真實屈光度</h2>
        <div class="field-row">
          <div class="field">
            <label id="patientSphereLabel">sphere power</label>
            <input type="number" id="patientSphere" step="0.25" value="0.00">
          </div>
          <div class="field">
            <label id="patientCylLabel">cylinder power</label>
            <input type="number" id="patientCyl" step="0.25" value="0.00">
          </div>
          <div class="field">
            <label id="patientAxisLabel">cylinder angle</label>
            <input type="number" id="patientAxis" step="1" value="180" min="0" max="180">
          </div>
        </div>
      </div>

      <div class="panel" id="refractiveErrorPanel">
        <h2 id="refractiveErrorPanelTitle">refractive error</h2>
        <div id="minusCylDisplay"></div>
        <div id="plusCylDisplay"></div>
      </div>

      <div class="panel" id="testPanel">
        <h2 id="testPanelTitle">你的判讀</h2>
        <div class="field-row">
          <div class="field">
            <label id="guessSphereLabel">sphere (-20~+20)</label>
            <input type="number" id="guessSphere" step="0.25">
          </div>
          <div class="field">
            <label id="guessCylLabel">cylinder (-6~+6)</label>
            <input type="number" id="guessCyl" step="0.25">
          </div>
          <div class="field">
            <label id="guessAxisLabel">axis (0~180)</label>
            <input type="number" id="guessAxis" step="1">
          </div>
        </div>
        <button id="checkAnswerBtn" type="button">檢查答案</button>
        <div class="answer-feedback" id="answerFeedback"></div>
      </div>

      <div class="panel">
        <h2 id="lensesPanelTitle">lenses</h2>
        <div class="field-row">
          <div class="field">
            <label>sphere power</label>
            <input type="number" id="lensSphere" step="0.25" value="0.00">
          </div>
          <div class="field">
            <label>cylinder power</label>
            <input type="number" id="lensCyl" step="0.25" value="0.00">
          </div>
          <div class="field">
            <label>cylinder angle</label>
            <input type="number" id="lensAxis" step="1" value="180" min="0" max="180">
          </div>
        </div>
      </div>

      <div class="panel">
        <h2 id="streakPanelTitle">streak angle</h2>
        <input type="number" id="streakAngle" step="1" value="180" min="0" max="180">
        <div class="quick-buttons">
          <button type="button" data-angle="45">45°</button>
          <button type="button" data-angle="90">90°</button>
          <button type="button" data-angle="135">135°</button>
          <button type="button" data-angle="180">180°</button>
        </div>
      </div>

      <div class="panel">
        <h2 id="wdPanelTitle">working distance</h2>
        <input type="number" id="workingDistanceInput" step="0.25" value="1.50">
        <div class="quick-buttons">
          <button type="button" data-wd="2.00">50cm / 2.00D</button>
          <button type="button" data-wd="1.50">67cm / 1.50D</button>
          <button type="button" data-wd="1.00">100cm / 1.00D</button>
        </div>
      </div>
    </div>
  </div>

  <!-- BEGIN INLINE SCRIPTS: generated from optics.js + presets.js + app.js by build.js — do not hand-edit below this point, edit those source files and re-run `node build.js` instead -->
  <script src="optics.js"></script>
  <script src="presets.js"></script>
  <script src="app.js"></script>
  <!-- END INLINE SCRIPTS -->
</body>
</html>
```

During Tasks 6-11 below, keep the three `<script src>` lines as-is (fastest iteration loop — edit `app.js`/`optics.js`/`presets.js` directly and reload). Task 12 replaces this block with fully inlined `<script>` tags to produce the single-file deliverable; the markers above exist so that step can find and replace this exact region programmatically.

- [ ] **Step 2: Verify it renders**

Open `tools/retinoscopy-simulator/index.html` directly in a browser (double-click, or via the Browser pane preview tool). Confirm: title shows, preset dropdown is empty (expected — wired in Task 9), explore/test tabs are visible, all panels render without console errors (the missing `app.js` 404 is expected and fixed in Task 6).

- [ ] **Step 3: Commit**

```bash
git add tools/retinoscopy-simulator/index.html
git commit -m "feat: add retinoscopy simulator page skeleton"
```

---

## Task 6: App state + control wiring (no rendering yet)

**Files:**
- Create: `tools/retinoscopy-simulator/app.js`

- [ ] **Step 1: Write the state module and control wiring**

Create `tools/retinoscopy-simulator/app.js`:

```js
(function () {
  'use strict';

  var state = {
    mode: 'explore',
    patient: { sphere: 0.00, cyl: 0.00, axis: 180 },
    lens: { sphere: 0.00, cyl: 0.00, axis: 180 },
    streakAngle: 180,
    workingDistanceD: 1.50
  };

  function $(id) { return document.getElementById(id); }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function readNumber(input, fallback) {
    var value = parseFloat(input.value);
    return isNaN(value) ? fallback : value;
  }

  function render() {
    // filled in by Task 7 (canvas) and Task 8 (refractive error display)
  }

  function bindNumberInput(id, onChange) {
    var input = $(id);
    input.addEventListener('change', function () {
      onChange(readNumber(input, 0));
      render();
    });
  }

  bindNumberInput('patientSphere', function (v) { state.patient.sphere = v; });
  bindNumberInput('patientCyl', function (v) { state.patient.cyl = v; });
  bindNumberInput('patientAxis', function (v) { state.patient.axis = clamp(v, 0, 180); });
  bindNumberInput('lensSphere', function (v) { state.lens.sphere = v; });
  bindNumberInput('lensCyl', function (v) { state.lens.cyl = v; });
  bindNumberInput('lensAxis', function (v) { state.lens.axis = clamp(v, 0, 180); });
  bindNumberInput('streakAngle', function (v) { state.streakAngle = clamp(v, 0, 180); });
  bindNumberInput('workingDistanceInput', function (v) { state.workingDistanceD = v; });

  Array.prototype.forEach.call(document.querySelectorAll('.quick-buttons button[data-angle]'), function (btn) {
    btn.addEventListener('click', function () {
      state.streakAngle = parseFloat(btn.dataset.angle);
      $('streakAngle').value = state.streakAngle.toFixed(0);
      render();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('.quick-buttons button[data-wd]'), function (btn) {
    btn.addEventListener('click', function () {
      state.workingDistanceD = parseFloat(btn.dataset.wd);
      $('workingDistanceInput').value = state.workingDistanceD.toFixed(2);
      render();
    });
  });

  function setMode(mode) {
    state.mode = mode;
    $('exploreTabBtn').classList.toggle('active', mode === 'explore');
    $('testTabBtn').classList.toggle('active', mode === 'test');
    $('explorePanel').classList.toggle('visible', mode === 'explore');
    $('refractiveErrorPanel').classList.toggle('visible', mode === 'explore');
    $('testPanel').classList.toggle('visible', mode === 'test');
  }

  $('exploreTabBtn').addEventListener('click', function () { setMode('explore'); });
  $('testTabBtn').addEventListener('click', function () { setMode('test'); });
  setMode('explore');

  render();

  window.__retSim = { state: state, render: render, setMode: setMode, clamp: clamp };
}());
```

- [ ] **Step 2: Verify in browser**

Reload `index.html`. Confirm: no console errors, clicking "test" tab hides the patient/refractive-error panels and shows the guess panel, clicking "explore" switches back, changing any number input and pressing Tab/Enter doesn't error (check via `read_console_messages`). In the browser console, run `__retSim.state.patient.sphere = -3; __retSim.render();` and confirm no error is thrown.

- [ ] **Step 3: Commit**

```bash
git add tools/retinoscopy-simulator/app.js
git commit -m "feat: wire simulator state and explore/test tab switching"
```

---

## Task 7: Canvas eye rendering with reflex (static, no drag yet)

**Files:**
- Modify: `tools/retinoscopy-simulator/app.js`

- [ ] **Step 1: Add canvas drawing and reflex computation**

Modify `tools/retinoscopy-simulator/app.js` — insert this block immediately after the `readNumber` function and before `function render() {`:

```js
  var canvas = $('eyeCanvas');
  var ctx = canvas.getContext('2d');
  var dragState = { offset: 0 };

  function computeReflex() {
    var neutral = Optics.neutralPowerAt(
      state.patient.sphere, state.patient.cyl, state.patient.axis,
      state.workingDistanceD, state.streakAngle
    );
    var dialed = Optics.meridianPower(
      state.lens.sphere, state.lens.cyl, state.lens.axis, state.streakAngle
    );
    return Optics.compareReflex(dialed, neutral);
  }

  // Simplified, non-physically-rigorous visual cue (spec section 4/9): when the
  // streak angle isn't aligned with the patient's true cylinder axis, the reflex
  // band appears rotated relative to the sweep direction. Real retinoscopy shows
  // this as an actual optical skew; here it's an approximation for teaching intuition.
  function computeSkewDeg() {
    if (state.patient.cyl === 0) return 0;
    var diff = state.streakAngle - state.patient.axis;
    diff = ((diff + 90) % 180 + 180) % 180 - 90;
    return clamp(diff * 0.3, -20, 20);
  }

  function drawReflex(cx, cy, irisRadius) {
    var reflex = computeReflex();
    var pupilRadius = irisRadius * 0.45;

    ctx.fillStyle = '#150d08';
    ctx.beginPath();
    ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    if (reflex.state === 'neutral') {
      ctx.fillStyle = '#ff3b1f';
      ctx.beginPath();
      ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    var bandWidth = clamp(
      pupilRadius * 1.6 * (1 - Math.min(reflex.magnitude, 6) / 6),
      pupilRadius * 0.15,
      pupilRadius * 1.2
    );
    var angleRad = (state.streakAngle + computeSkewDeg()) * Math.PI / 180;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    ctx.fillStyle = '#ff3b1f';
    ctx.beginPath();
    ctx.ellipse(dragState.offset, 0, bandWidth / 2, pupilRadius * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawEye() {
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#f2e9e4';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 10, h / 2 - 20, 0, 0, Math.PI * 2);
    ctx.fill();

    var irisRadius = h * 0.42;
    var gradient = ctx.createRadialGradient(w / 2, h / 2, irisRadius * 0.2, w / 2, h / 2, irisRadius);
    gradient.addColorStop(0, '#6b4a2f');
    gradient.addColorStop(0.6, '#4a3320');
    gradient.addColorStop(1, '#2c1f14');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, irisRadius, 0, Math.PI * 2);
    ctx.fill();

    drawReflex(w / 2, h / 2, irisRadius);
  }
```

Replace the empty `function render() {` body:

```js
  function render() {
    drawEye();
  }
```

- [ ] **Step 2: Verify in browser**

Reload `index.html`. Confirm the eye renders with a solid red pupil (patient/lens both at 0.00 = neutral by default). In the console, run:

```js
__retSim.state.patient.sphere = -3.00; __retSim.render();
```

Confirm the pupil now shows a dark ring with a red band rather than a solid fill (since lens is still 0.00 and patient is -3.00, off neutral).

Now test the skew cue with an astigmatic case: `__retSim.state.patient.sphere = 0; __retSim.state.patient.cyl = -2.00; __retSim.state.patient.axis = 180; __retSim.state.streakAngle = 135; __retSim.render();`. Since the streak (135°) is 45° off the true axis (180°), the band should render visibly rotated relative to a plain 135° line. Then set `__retSim.state.streakAngle = 180;` (matching the axis exactly) and re-render — confirm the band is no longer rotated (skew is 0 when the streak aligns with the axis).

- [ ] **Step 3: Commit**

```bash
git add tools/retinoscopy-simulator/app.js
git commit -m "feat: render eye and reflex band on canvas"
```

---

## Task 8: Mouse and touch drag sweep interaction

**Files:**
- Modify: `tools/retinoscopy-simulator/app.js`

- [ ] **Step 1: Replace the placeholder dragState and add drag handlers**

Modify `tools/retinoscopy-simulator/app.js` — replace:

```js
  var dragState = { offset: 0 };
```

with:

```js
  var dragState = { offset: 0, active: false, lastX: 0, lastY: 0 };
```

- [ ] **Step 2: Add the drag event handlers**

Insert this block immediately after the `drawEye` function definition (still before `function render() {`):

```js
  function pointerPos(evt) {
    var rect = canvas.getBoundingClientRect();
    var point = evt.touches ? evt.touches[0] : evt;
    return {
      x: (point.clientX - rect.left) * (canvas.width / rect.width),
      y: (point.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function projectAlongStreak(dx, dy) {
    var angleRad = state.streakAngle * Math.PI / 180;
    var axisX = Math.sin(angleRad);
    var axisY = -Math.cos(angleRad);
    return dx * axisX + dy * axisY;
  }

  function onDragStart(evt) {
    evt.preventDefault();
    var pos = pointerPos(evt);
    dragState.active = true;
    dragState.lastX = pos.x;
    dragState.lastY = pos.y;
  }

  function onDragMove(evt) {
    if (!dragState.active) return;
    evt.preventDefault();
    var pos = pointerPos(evt);
    var dx = pos.x - dragState.lastX;
    var dy = pos.y - dragState.lastY;
    var reflex = computeReflex();
    var direction = reflex.state === 'against' ? -1 : 1;
    dragState.offset = clamp(dragState.offset + projectAlongStreak(dx, dy) * direction, -60, 60);
    dragState.lastX = pos.x;
    dragState.lastY = pos.y;
    drawEye();
  }

  function onDragEnd() {
    dragState.active = false;
  }

  canvas.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  canvas.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);
```

- [ ] **Step 3: Verify in browser**

Reload `index.html`. In the console, set up an off-neutral state: `__retSim.state.patient.sphere = -3.00; __retSim.render();`. Then use the browser tool's `computer` action with `left_click_drag` from the center of the canvas to a point to its right, and take a screenshot. Confirm the red band visibly shifts position inside the pupil (rather than staying centered). Release (mouseup) and confirm the band stays at its last dragged position rather than snapping back.

- [ ] **Step 4: Commit**

```bash
git add tools/retinoscopy-simulator/app.js
git commit -m "feat: add mouse/touch drag sweep interaction for the streak"
```

---

## Task 9: Refractive error display (plus/minus cylinder)

**Files:**
- Modify: `tools/retinoscopy-simulator/app.js`

- [ ] **Step 1: Add the display function**

Insert this block immediately after the `onDragEnd` function and its three `addEventListener` registrations from Task 8, still before `function render() {`:

```js
  function formatRx(sphere, cyl, axis) {
    function fmt(n) {
      return (n >= 0 ? '+' : '') + n.toFixed(2);
    }
    return fmt(sphere) + ' ' + fmt(cyl) + ' x ' + Math.round(axis) + '°';
  }

  function updateRefractiveErrorDisplay() {
    var minus = state.patient;
    var plus = Optics.plusCylToMinusCyl(minus.sphere, minus.cyl, minus.axis);
    $('minusCylDisplay').textContent = '負柱面：' + formatRx(minus.sphere, minus.cyl, minus.axis);
    $('plusCylDisplay').textContent = '正柱面：' + formatRx(plus.sphere, plus.cyl, plus.axis);
  }
```

- [ ] **Step 2: Call it from render()**

Modify the `render` function:

```js
  function render() {
    drawEye();
    updateRefractiveErrorDisplay();
  }
```

- [ ] **Step 3: Verify in browser**

Reload `index.html`. In the console: `__retSim.state.patient.sphere = 0; __retSim.state.patient.cyl = -2; __retSim.state.patient.axis = 180; __retSim.render();`. Confirm the refractive error panel shows `負柱面：+0.00 -2.00 x 180°` and `正柱面：-2.00 +2.00 x 90°`.

- [ ] **Step 4: Commit**

```bash
git add tools/retinoscopy-simulator/app.js
git commit -m "feat: display plus and minus cylinder notation for the patient Rx"
```

---

## Task 10: Test mode — answer input, validation, and scoring

**Files:**
- Modify: `tools/retinoscopy-simulator/app.js`

- [ ] **Step 1: Add validation and check-answer logic**

Insert this block immediately before the closing `window.__retSim = {...}` line:

```js
  function validateRange(value, min, max) {
    return !isNaN(value) && value >= min && value <= max;
  }

  $('checkAnswerBtn').addEventListener('click', function () {
    var sphere = readNumber($('guessSphere'), NaN);
    var cyl = readNumber($('guessCyl'), NaN);
    var axis = readNumber($('guessAxis'), NaN);
    var feedback = $('answerFeedback');

    if (!validateRange(sphere, -20, 20) || !validateRange(cyl, -6, 6) || !validateRange(axis, 0, 180)) {
      feedback.textContent = '請輸入有效數字：sphere -20~+20、cylinder -6~+6、axis 0~180';
      feedback.className = 'answer-feedback incorrect';
      return;
    }

    var actual = state.patient;
    var sphereDiff = Math.abs(sphere - actual.sphere);
    var cylDiff = Math.abs(cyl - actual.cyl);
    var axisDiff = Math.abs(axis - actual.axis);

    var sphereOk = sphereDiff <= 0.25;
    var cylOk = cylDiff <= 0.25;
    var axisOk = actual.cyl === 0 || axisDiff <= 5;

    if (sphereOk && cylOk && axisOk) {
      feedback.textContent = '正確！';
      feedback.className = 'answer-feedback correct';
    } else if (sphereDiff <= 1 && cylDiff <= 1 && (actual.cyl === 0 || axisDiff <= 15)) {
      feedback.textContent = '接近了，再檢查一次掃描方向與中和點。';
      feedback.className = 'answer-feedback close';
    } else {
      feedback.textContent = '不正確，再試一次。提示：先中和 sphere，再找柱面軸。';
      feedback.className = 'answer-feedback incorrect';
    }
  });
```

- [ ] **Step 2: Verify in browser**

Reload `index.html`. Set a known preset via console: `__retSim.state.patient.sphere = -1.50; __retSim.state.patient.cyl = 0; __retSim.state.patient.axis = 180;`. Click the "test" tab. Fill in guess sphere `-1.50`, cyl `0`, axis `180`, click "檢查答案" — confirm feedback shows "正確！" in green. Change guess sphere to `5.00` and re-check — confirm feedback shows the incorrect message in red. Enter guess sphere `50` (out of range) and re-check — confirm the range-validation message appears.

- [ ] **Step 3: Commit**

```bash
git add tools/retinoscopy-simulator/app.js
git commit -m "feat: add test-mode answer validation and tolerance-based scoring"
```

---

## Task 11: Presets dropdown and language toggle

**Files:**
- Modify: `tools/retinoscopy-simulator/app.js`

- [ ] **Step 1: Wire the presets dropdown**

Insert this block immediately before the closing `window.__retSim = {...}` line:

```js
  var presetSelect = $('presetSelect');
  var placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = '— 選擇預設案例 —';
  presetSelect.appendChild(placeholderOption);

  Presets.forEach(function (preset, index) {
    var option = document.createElement('option');
    option.value = String(index);
    option.textContent = (index + 1) + '. ' + preset.label;
    presetSelect.appendChild(option);
  });

  presetSelect.addEventListener('change', function () {
    if (presetSelect.value === '') return;
    var preset = Presets[parseInt(presetSelect.value, 10)];
    state.patient.sphere = preset.sphere;
    state.patient.cyl = preset.cyl;
    state.patient.axis = preset.axis;
    $('patientSphere').value = preset.sphere.toFixed(2);
    $('patientCyl').value = preset.cyl.toFixed(2);
    $('patientAxis').value = preset.axis.toFixed(0);
    render();
  });
```

- [ ] **Step 2: Wire the language toggle**

Insert this block right after the presets-dropdown block, still before `window.__retSim = {...}`:

```js
  var i18n = {
    pageTitle: { hant: '視網膜檢影鏡模擬器', hans: '视网膜检影镜模拟器' },
    explorePanelTitle: { hant: '病人真實屈光度', hans: '病人真实屈光度' },
    refractiveErrorPanelTitle: { hant: 'refractive error', hans: 'refractive error' },
    testPanelTitle: { hant: '你的判讀', hans: '你的判读' },
    lensesPanelTitle: { hant: 'lenses', hans: 'lenses' },
    streakPanelTitle: { hant: 'streak angle', hans: 'streak angle' },
    wdPanelTitle: { hant: 'working distance', hans: 'working distance' },
    patientSphereLabel: { hant: 'sphere power', hans: 'sphere power' },
    patientCylLabel: { hant: 'cylinder power', hans: 'cylinder power' },
    patientAxisLabel: { hant: 'cylinder angle', hans: 'cylinder angle' },
    guessSphereLabel: { hant: 'sphere (-20~+20)', hans: 'sphere (-20~+20)' },
    guessCylLabel: { hant: 'cylinder (-6~+6)', hans: 'cylinder (-6~+6)' },
    guessAxisLabel: { hant: 'axis (0~180)', hans: 'axis (0~180)' },
    checkAnswerBtn: { hant: '檢查答案', hans: '检查答案' },
    dragHint: { hant: '在眼睛上按住滑鼠（或手指）拖曳，模擬掃描光帶', hans: '在眼睛上按住鼠标（或手指）拖曳，模拟扫描光带' }
  };

  var currentLang = 'hant';

  function applyLanguage() {
    Object.keys(i18n).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = i18n[id][currentLang];
    });
  }

  $('langToggle').addEventListener('click', function () {
    currentLang = currentLang === 'hant' ? 'hans' : 'hant';
    applyLanguage();
  });
```

Note: the language toggle covers static headings/labels only. Dynamic feedback text (test-mode results) and preset names stay in Traditional Chinese regardless of toggle state — this is an intentional scope limit (documented in the spec as non-goal-adjacent), not a bug.

- [ ] **Step 3: Verify in browser**

Reload `index.html`. Select preset "7. 單純近視性散光（順規）" from the dropdown — confirm the patient sphere/cyl/axis inputs update to `0.00` / `-2.00` / `180` and the refractive error panel updates accordingly. Click the "繁/简" button — confirm the page title and panel headings switch to Simplified Chinese; click again to confirm it switches back.

- [ ] **Step 4: Commit**

```bash
git add tools/retinoscopy-simulator/app.js
git commit -m "feat: add preset selector and zh-Hant/zh-Hans language toggle"
```

---

## Task 12: Build script — inline everything into a single-file deliverable

**Files:**
- Create: `tools/retinoscopy-simulator/build.js`
- Modify: `tools/retinoscopy-simulator/index.html` (generated output, not hand-edited)

- [ ] **Step 1: Write the build script**

Create `tools/retinoscopy-simulator/build.js`:

```js
'use strict';
var fs = require('fs');
var path = require('path');

var dir = __dirname;
var optics = fs.readFileSync(path.join(dir, 'optics.js'), 'utf8');
var presets = fs.readFileSync(path.join(dir, 'presets.js'), 'utf8');
var app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
var html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

var startMarker = '<!-- BEGIN INLINE SCRIPTS';
var endMarker = '<!-- END INLINE SCRIPTS -->';
var startIdx = html.indexOf(startMarker);
var endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Could not find BEGIN/END INLINE SCRIPTS markers in index.html');
}
endIdx += endMarker.length;

var comment = '<!-- BEGIN INLINE SCRIPTS: generated from optics.js + presets.js + app.js by build.js — do not hand-edit, re-run `node build.js` after editing those source files -->';
var inlined = [
  comment,
  '<script>', optics, '</script>',
  '<script>', presets, '</script>',
  '<script>', app, '</script>',
  endMarker
].join('\n');

var output = html.slice(0, startIdx) + inlined + html.slice(endIdx);
fs.writeFileSync(path.join(dir, 'index.html'), output, 'utf8');
console.log('index.html regenerated with inlined scripts (' + output.length + ' bytes).');
```

- [ ] **Step 2: Run it**

Run: `cd tools/retinoscopy-simulator && node build.js`
Expected output: `index.html regenerated with inlined scripts (N bytes).`

- [ ] **Step 3: Verify the deliverable is truly standalone**

Run this to confirm no `<script src=` remains in the shipped file:

```bash
grep -c "script src" tools/retinoscopy-simulator/index.html
```

Expected: `0`

Then verify it still works with the source files out of the picture — temporarily move them aside, reload the page, move them back:

```bash
mkdir -p /tmp/retsim-check && mv tools/retinoscopy-simulator/optics.js tools/retinoscopy-simulator/presets.js tools/retinoscopy-simulator/app.js /tmp/retsim-check/
```

Reload `tools/retinoscopy-simulator/index.html` in the Browser pane preview tool (or double-click it). Confirm the page still fully works — presets load, dragging the eye still shows reflex motion, no console errors. Then restore the source files:

```bash
mv /tmp/retsim-check/optics.js /tmp/retsim-check/presets.js /tmp/retsim-check/app.js tools/retinoscopy-simulator/
```

- [ ] **Step 4: Re-run the Node test suite to confirm the source files are untouched**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: PASS (all tests, unchanged count) — `build.js` only reads these files, so this should never fail because of Step 2.

- [ ] **Step 5: Commit**

```bash
git add tools/retinoscopy-simulator/build.js tools/retinoscopy-simulator/index.html
git commit -m "build: inline scripts into a single-file index.html deliverable"
```

**Note for future edits:** whenever `optics.js`, `presets.js`, or `app.js` changes, re-run `node build.js` before sharing `index.html` — it's a generated file from that point on, not hand-maintained.

---

## Task 13: Full manual QA pass and memory log

**Files:**
- No code changes expected (fixes only if QA finds a bug — fix the relevant source file, then re-run `node build.js`)
- Modify (append): `memory/2026-07-15.md` (create if it doesn't exist yet today)
- Modify: `MEMORY.md`

- [ ] **Step 1: Run the full automated test suite one more time**

Run: `cd tools/retinoscopy-simulator && node --test`
Expected: PASS (all optics + presets tests, 17+ total)

- [ ] **Step 2: Manual QA checklist in the browser**

Open `tools/retinoscopy-simulator/index.html` in the Browser pane preview tool and walk through:
- [ ] Each of the 13 presets loads correctly and the refractive-error panel matches the spec table (section 7)
- [ ] Working-distance quick buttons (50cm/67cm/100cm) update the input and shift the neutral point. Verify with preset 3 (sphere -4.00, cyl 0): at 67cm/1.50D working distance, neutral power = -4.00 + 1.50 = -2.50D. With the lens dialed to `0.00` (no correction), `Optics.compareReflex(0, -2.50)` returns `against` — confirm the canvas shows against-motion styling for this state, and that dialing the lens sphere down to `-2.50` neutralizes it (solid fill)
- [ ] Drag-to-sweep on the canvas moves the band and the direction visually differs between a "with" case (e.g. preset 5, hyperope, no lens) and an "against" case (e.g. preset 3, myope, no lens)
- [ ] Dialing the lens sphere/cyl/axis to match a preset's values (plus working distance) neutralizes the reflex to a solid fill
- [ ] Streak angle quick buttons (45/90/135/180) change the sweep axis and the reflex recalculates for astigmatic presets (7-13)
- [ ] For an astigmatic preset (e.g. preset 9), setting the streak angle away from the patient's axis shows a visibly rotated/skewed band; setting it exactly to the axis removes the skew
- [ ] Test mode hides the patient panel, accepts a guess, validates range, and scores correct/close/incorrect appropriately
- [ ] Language toggle switches headings between Traditional and Simplified Chinese and back
- [ ] `read_console_messages` shows no errors throughout

Fix any bugs found directly in `tools/retinoscopy-simulator/app.js` (or `optics.js`/`presets.js` if the bug is in the logic layer), re-run `node build.js` to regenerate `index.html`, re-run the relevant verify step, then commit the fix (source files + regenerated `index.html` together) separately with a `fix:` message before continuing.

- [ ] **Step 3: Write the memory log entry**

Create or append to `memory/2026-07-15.md`:

```markdown
## [HH:MM] — 視網膜檢影鏡模擬器（Retinoscopy Simulator）
- 依 AAO 原版功能完整復刻，單一資料夾 `tools/retinoscopy-simulator/`（index.html + app.js + optics.js + presets.js，零依賴）
- 光學邏輯（子午線度數、working distance、順動/逆動/中和判斷、正負柱面互換）用 Node 內建測試跑過
- 13 組預設臨床案例、explore/test 兩模式、滑鼠/觸控拖曳掃描、繁簡切換
- 設計文件：docs/superpowers/specs/2026-07-15-retinoscopy-simulator-design.md
- 待跟進：目前用風格化 Canvas 繪製眼睛，若要更擬真可換成插畫素材；語言切換只涵蓋標題/標籤，動態回饋文字仍是繁中
```

(Replace `[HH:MM]` with the actual current time.)

- [ ] **Step 4: Update MEMORY.md**

Add one line under an appropriate section (e.g. near "現役系統狀態" or a new small entry) in `C:\Users\w7\Desktop\optometry-notes\MEMORY.md`:

```markdown
### 視網膜檢影鏡模擬器（2026-07-15）
教學工具，`tools/retinoscopy-simulator/index.html`，單一資料夾零依賴，可雙擊開啟或嵌入課程網頁。功能：explore/test 模式、working distance、拖曳掃描光帶、13 組預設案例、繁簡切換。
```

- [ ] **Step 5: Commit**

```bash
git add memory/2026-07-15.md MEMORY.md
git commit -m "docs: log retinoscopy simulator build in project memory"
```
