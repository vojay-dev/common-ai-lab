'use strict';

// ── Starfield ────────────────────────────────────────────────────────────────
const cvs = document.getElementById('sky'), ctx = cvs.getContext('2d');
let W, H;
function resize() { W = cvs.width = innerWidth; H = cvs.height = innerHeight; }
addEventListener('resize', resize); resize();

const STARS = Array.from({ length: 220 }, () => ({
  x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3,
  ph: Math.random() * 6.28, sp: Math.random() * .011 + .003,
  col: ['#E8E0D5', '#E8E0D5', '#E8E0D5', '#FFB32D', '#13BDD7', '#872DED'][Math.floor(Math.random() * 6)]
}));
const CX = () => W * .58, CY = () => H * .48;
const orbits = [
  { rx: .32, ry: .12, tilt: -.14, sp: .0004, ph: 0, dotR: 11, col: '#FFB32D' },
  { rx: .22, ry: .09, tilt: -.07, sp: .0007, ph: 2, dotR: 9, col: '#13BDD7' },
  { rx: .41, ry: .16, tilt: -.21, sp: .00025, ph: 4, dotR: 11, col: '#F03A47' },
  { rx: .14, ry: .055, tilt: -.03, sp: .0012, ph: 1, dotR: 8, col: '#19BA5A' },
  { rx: .50, ry: .19, tilt: -.27, sp: .00015, ph: 3, dotR: 10, col: '#2676FF' },
  { rx: .08, ry: .032, tilt: .02, sp: .002, ph: 5, dotR: 5, col: '#872DED' },
];

function drawStars() {
  requestAnimationFrame(drawStars);
  ctx.clearRect(0, 0, W, H);
  for (const s of STARS) {
    s.ph += s.sp;
    ctx.globalAlpha = Math.max(0, .3 + Math.sin(s.ph) * .28);
    ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.28); ctx.fill();
  }
  const ox = CX(), oy = CY();
  for (const o of orbits) {
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(o.tilt);
    ctx.globalAlpha = .04; ctx.strokeStyle = '#E8E0D5'; ctx.lineWidth = .6;
    ctx.beginPath(); ctx.ellipse(0, 0, o.rx * W, o.ry * H, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    o.ph += o.sp;
    const rx = o.rx * W, ry = o.ry * H, lx = Math.cos(o.ph) * rx, ly = Math.sin(o.ph) * ry;
    const px = ox + lx * Math.cos(o.tilt) - ly * Math.sin(o.tilt);
    const py = oy + lx * Math.sin(o.tilt) + ly * Math.cos(o.tilt);
    ctx.globalAlpha = .08;
    const g = ctx.createRadialGradient(px, py, 0, px, py, o.dotR * 5);
    g.addColorStop(0, o.col); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, o.dotR * 5, 0, 6.28); ctx.fill();
    ctx.globalAlpha = .85; ctx.fillStyle = o.col;
    ctx.beginPath(); ctx.arc(px, py, o.dotR, 0, 6.28); ctx.fill();
    ctx.globalAlpha = .3; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px - o.dotR * .3, py - o.dotR * .3, o.dotR * .32, 0, 6.28); ctx.fill();
  }
  if (Math.random() < .004) {
    const sx = Math.random() * W, sy = Math.random() * H * .35;
    const len = 80 + Math.random() * 120, ang = .45 + Math.random() * .5;
    const ex = sx + Math.cos(ang) * len, ey = sy + Math.sin(ang) * len;
    const gr = ctx.createLinearGradient(sx, sy, ex, ey);
    gr.addColorStop(0, 'rgba(232,224,213,.5)'); gr.addColorStop(1, 'rgba(232,224,213,0)');
    ctx.globalAlpha = 1; ctx.strokeStyle = gr; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
}
drawStars();

// ── Utilities ────────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function burst(x, y, col = '#FFB32D', n = 12) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div'); p.className = 'particle';
    const sz = 4 + Math.random() * 6, a = Math.random() * 360, d = 40 + Math.random() * 60;
    const dx = Math.cos(a * Math.PI / 180) * d, dy = Math.sin(a * Math.PI / 180) * d;
    Object.assign(p.style, {
      width: sz + 'px', height: sz + 'px', background: col,
      left: (x + dx) + 'px', top: (y + dy) + 'px', boxShadow: `0 0 ${sz * 2}px ${col}`
    });
    document.body.appendChild(p); setTimeout(() => p.remove(), 850);
  }
}

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ── State ────────────────────────────────────────────────────────────────────
const state = { chapterScores: {}, currentChapter: null };

// ── Terminal Quiz Renderer ───────────────────────────────────────────────────
function renderTerminalQuiz(container, chapter) {
  let qi = 0, score = 0;
  function next() {
    const q = SETUP_QUESTIONS[qi];
    let filled = false, firstTry = true, wrongIds = new Set();
    const opts = shuffle(q.options.map((t, i) => ({ i, t, ok: t === q.answer })));

    function draw() {
      document.getElementById('puz-score').textContent = `Score: ${score} / ${SETUP_QUESTIONS.length}`;
      const tHTML = q.terminal.split('___').join(
        filled ? `<span class="t-blank filled">${q.answer}</span>` : `<span class="t-blank">???</span>`
      );
      container.innerHTML = `
        <div class="puz-header"><div class="eyebrow eyebrow-purple">Mission 01 · Step ${qi + 1} of ${SETUP_QUESTIONS.length}</div><h2>${q.title}</h2></div>
        <div class="progress-dots">${SETUP_QUESTIONS.map((_, i) => `<div class="dot ${i < qi ? 'done' : i === qi ? 'active' : ''}"></div>`).join('')}</div>
        <div class="terminal"><div class="terminal-bar">
          <div class="terminal-bar-dot" style="background:#FF5F56"></div><div class="terminal-bar-dot" style="background:#FFBD2E"></div>
          <div class="terminal-bar-dot" style="background:#27C93F"></div><span class="terminal-bar-file">${q.file}</span></div>
          <div class="terminal-body">${tHTML}</div></div>
        ${!filled ? `<div class="t-options">${opts.map(o => `<div class="t-opt ${wrongIds.has(o.i) ? 'used' : ''}" data-i="${o.i}">${o.t}</div>`).join('')}</div>` : ''}
        <div class="feedback-box ${filled ? 'show' : ''}" id="fb">${filled ? `<div class="fb-title">Correct</div><p>${q.explain}</p>` : ''}</div>
        ${filled ? `<div style="text-align:right;margin-top:12px"><button class="btn btn-gold btn-sm" id="btn-pnext">${qi < SETUP_QUESTIONS.length - 1 ? 'Next Step' : 'Complete Mission'}</button></div>` : ''}`;

      if (!filled) {
        document.querySelectorAll('.t-opt:not(.used)').forEach(el => {
          el.addEventListener('click', () => {
            const o = opts.find(x => x.i === +el.dataset.i);
            if (o.ok) {
              filled = true; if (firstTry) score++; draw();
              const b = document.querySelector('.t-blank');
              if (b) { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, '#19BA5A', 10); }
            } else {
              firstTry = false; wrongIds.add(o.i);
              el.style.animation = 'shake-h .3s'; setTimeout(() => draw(), 350);
            }
          });
        });
      }
      if (filled) {
        document.getElementById('btn-pnext')?.addEventListener('click', () => {
          qi++;
          qi >= SETUP_QUESTIONS.length ? finishChapter(chapter, 'setup', score, SETUP_QUESTIONS.length) : next();
        });
      }
    }
    draw();
  }
  next();
}

// ── DAG Builder Renderer ─────────────────────────────────────────────────────
function renderDagBuilder(container, chapter) {
  let idx = 0, score = 0;
  function next() {
    const sc = DAG_SCENARIOS[idx];
    let filled = false, firstTry = true, wrongIds = new Set();
    const opts = shuffle(sc.nodes.find(n => n.type === 'slot').options);

    function draw() {
      const slot = sc.nodes.find(n => n.type === 'slot');
      const fOpt = filled ? slot.options.find(o => o.id === slot.correct) : null;
      let dg = '';
      for (let i = 0; i < sc.nodes.length; i++) {
        if (i > 0) dg += bArrow(sc.nodes, i, filled);
        dg += bNode(sc.nodes[i], fOpt);
      }
      if (sc.branches) dg += bFork(sc.branches, filled);

      document.getElementById('puz-score').textContent = `Score: ${score} / ${DAG_SCENARIOS.length}`;
      container.innerHTML = `
        <div class="puz-header"><div class="eyebrow" style="color:var(--green)">Mission 03 · Pipeline ${idx + 1} of ${DAG_SCENARIOS.length}</div><h2>${sc.title}</h2></div>
        <div class="progress-dots">${DAG_SCENARIOS.map((_, i) => `<div class="dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></div>`).join('')}</div>
        <div class="dag-scenario"><div class="ds-text">${sc.desc}</div></div>
        <div class="dag-graph">${dg}</div>
        ${!filled ? `<div class="dag-options">${opts.map(o => `<div class="dag-opt ${wrongIds.has(o.id) ? 'used' : ''}" data-id="${o.id}">
          <div class="opt-name">${o.label}</div><div class="opt-desc">${o.desc}</div></div>`).join('')}</div>
          <div class="dag-hint" style="text-align:center;margin-top:10px">${sc.hint}</div>` : ''}
        <div class="feedback-box ${filled ? 'show' : ''}" id="fb">${filled ? `<div class="fb-title">Pipeline Connected</div><p>${sc.explain}</p>` : ''}</div>
        ${filled ? `<div style="text-align:right;margin-top:12px"><button class="btn btn-gold btn-sm" id="btn-pnext">${idx < DAG_SCENARIOS.length - 1 ? 'Next Pipeline' : 'Complete Mission'}</button></div>` : ''}`;

      if (!filled) {
        document.querySelectorAll('.dag-opt:not(.used)').forEach(c => {
          c.addEventListener('click', () => {
            if (c.dataset.id === slot.correct) {
              filled = true; if (firstTry) score++; draw();
              const el = document.querySelector('.dag-node-correct');
              if (el) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, '#19BA5A', 16); }
            } else {
              firstTry = false; wrongIds.add(c.dataset.id);
              c.style.animation = 'shake-h .3s'; setTimeout(() => draw(), 350);
            }
          });
        });
      }
      if (filled) {
        document.getElementById('btn-pnext')?.addEventListener('click', () => {
          idx++;
          idx >= DAG_SCENARIOS.length ? finishChapter(chapter, 'pipelines', score, DAG_SCENARIOS.length) : next();
        });
      }
    }
    draw();
  }
  next();
}

function bNode(n, fOpt) {
  if (n.type === 'io') {
    const c = n.isOutput ? 'dag-node-output' : 'dag-node-io';
    return `<div class="dag-node ${c}"><div class="dag-label">${n.label}</div><div class="dag-sub">${n.sub}</div></div>`;
  }
  if (n.type === 'op') return `<div class="dag-node dag-node-op"><div class="dag-label">${n.label}</div><div class="dag-sub">${n.sub}</div></div>`;
  if (n.type === 'fixed') return `<div class="dag-node dag-node-fixed"><div class="dag-label">${n.label}</div><div class="dag-sub">${n.sub}</div></div>`;
  if (n.type === 'slot') {
    if (fOpt) return `<div class="dag-node dag-node-op dag-node-correct" style="animation:node-pop .35s var(--ease)">
      <div class="dag-label">${fOpt.label}</div><div class="dag-sub">${fOpt.desc}</div>${n.toolset ? `<div class="dag-badge">${n.toolset}</div>` : ''}</div>`;
    return `<div class="dag-node dag-node-slot"><div class="dag-label">?</div><div class="dag-sub">select</div></div>`;
  }
  return '';
}

function bArrow(ns, i, f) {
  const r = n => n.type === 'slot' ? f : true;
  return `<div class="dag-arrow ${r(ns[i - 1]) && r(ns[i]) ? 'lit' : ''}"></div>`;
}

function bFork(br, lit) {
  const c = lit ? '#13BDD7' : 'rgba(232,224,213,0.1)';
  const g = lit ? 'filter="drop-shadow(0 0 6px rgba(19,189,215,.5))"' : '';
  return `<div class="dag-fork"><svg viewBox="0 0 40 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 50L16 50L16 20L28 20" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${g}/>
    <polygon points="28,16 36,20 28,24" fill="${c}" ${g}/>
    <path d="M16 50L16 80L28 80" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${g}/>
    <polygon points="28,76 36,80 28,84" fill="${c}" ${g}/></svg></div>
    <div class="dag-branch-group">${br.map(b => `<div class="dag-branch-row"><div class="dag-node dag-node-output" style="min-width:130px;min-height:56px;padding:10px 14px">
      <div class="dag-label">${b.label}</div><div class="dag-sub">${b.sub}</div></div></div>`).join('')}</div>`;
}

// ── Wiring Board Renderer ────────────────────────────────────────────────────
function renderWiringBoard(container, chapter, dataKey) {
  const data = WIRE_DATA[dataKey], total = data.pairs.length;
  let sel = null, matched = new Set(), score = 0;
  let first = new Set(data.pairs.map(p => p.l.id));
  const sRight = shuffle(data.pairs.map(p => p.r));

  function draw() {
    const ec = data.color === 'teal' ? 'var(--teal)' : data.color === 'blue' ? 'var(--blue)' : 'var(--gold)';
    document.getElementById('puz-score').textContent = `${matched.size} / ${total} connected`;
    container.innerHTML = `
      <div class="puz-header"><div class="eyebrow" style="color:${ec}">${data.eyebrow}</div><h2>${data.title}</h2><p>${data.desc}</p></div>
      <div class="wire-board" id="wire-board">
        <div class="wire-col wire-left"><div class="wire-col-label">Concept</div>
          ${data.pairs.map(p => `<div class="wire-item wire-left-item ${matched.has(p.l.id) ? 'matched' : sel === p.l.id ? 'selected' : ''}" data-id="${p.l.id}">
            <div class="wi-name">${p.l.name}</div></div>`).join('')}</div>
        <div class="wire-svg-wrap" id="wire-svg-wrap"><svg id="wire-svg" xmlns="http://www.w3.org/2000/svg"></svg></div>
        <div class="wire-col wire-right"><div class="wire-col-label">Match</div>
          ${sRight.map(r => `<div class="wire-item wire-right-item ${matched.has(r.id) ? 'matched' : ''}" data-id="${r.id}">
            <div class="wi-name">${r.name}</div></div>`).join('')}</div></div>
      <div class="feedback-box" id="fb"></div>`;

    requestAnimationFrame(() => requestAnimationFrame(() => drawWires()));

    document.querySelectorAll('.wire-left-item:not(.matched)').forEach(e => {
      e.addEventListener('click', () => { sel = e.dataset.id; draw(); });
    });
    document.querySelectorAll('.wire-right-item:not(.matched)').forEach(e => {
      e.addEventListener('click', () => {
        if (!sel) return;
        if (e.dataset.id === sel) {
          if (first.has(sel)) score++;
          matched.add(sel); sel = null; draw();
          const r = e.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, '#19BA5A', 10);
          if (matched.size === total) setTimeout(() => finishChapter(chapter, dataKey, score, total), 600);
        } else {
          first.delete(sel); e.classList.add('wire-wrong');
          const fb = document.getElementById('fb'); fb.className = 'feedback-box show wrong-fb';
          fb.innerHTML = '<div class="fb-title">Wrong match</div><p>Try a different combination.</p>';
          sel = null; setTimeout(() => draw(), 500);
        }
      });
    });
  }

  function drawWires() {
    const board = document.getElementById('wire-board'), svg = document.getElementById('wire-svg');
    if (!board || !svg) return;
    const br = board.getBoundingClientRect();
    svg.setAttribute('width', br.width); svg.setAttribute('height', br.height);
    svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`); svg.innerHTML = '';
    for (const id of matched) {
      const lE = board.querySelector(`.wire-left-item[data-id="${id}"]`);
      const rE = board.querySelector(`.wire-right-item[data-id="${id}"]`);
      if (!lE || !rE) continue;
      const lr = lE.getBoundingClientRect(), rr = rE.getBoundingClientRect();
      const x1 = lr.right - br.left, y1 = lr.top + lr.height / 2 - br.top;
      const x2 = rr.left - br.left, y2 = rr.top + rr.height / 2 - br.top;
      const cp = Math.abs(x2 - x1) * .4;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`);
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#19BA5A');
      p.setAttribute('stroke-width', '2.5'); p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('opacity', '0.6'); svg.appendChild(p);
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      requestAnimationFrame(() => { p.style.transition = 'stroke-dashoffset 0.4s ease-out'; p.style.strokeDashoffset = '0'; });
    }
  }

  draw();
}

// ── Flow ─────────────────────────────────────────────────────────────────────
function missionState(i) {
  if (state.chapterScores[CHAPTERS[i].id] !== undefined) return 'done';
  const first = CHAPTERS.findIndex(c => state.chapterScores[c.id] === undefined);
  return i === first ? 'current' : 'locked';
}

function renderTimeline() {
  const g = document.getElementById('chapter-grid');
  g.innerHTML = CHAPTERS.map((ch, i) => {
    const s = missionState(i), isLast = i === CHAPTERS.length - 1;
    return `<div class="tl-item ${s}" data-ch="${ch.id}">
      <div class="tl-marker"><div class="tl-dot">${s === 'done' ? '✓' : i + 1}</div>${!isLast ? '<div class="tl-line"></div>' : ''}</div>
      <div class="tl-content"><div class="tl-num">Mission ${String(i + 1).padStart(2, '0')}</div>
        <div class="tl-title">${ch.title}</div><div class="tl-desc">${ch.desc}</div>
        <div class="tl-meta">${ch.meta}</div></div></div>`;
  }).join('');
  document.querySelectorAll('.tl-item:not(.locked)').forEach(el => {
    el.addEventListener('click', () => showExplain(el.dataset.ch));
  });
}

function showExplain(chId) {
  const ch = CHAPTERS.find(c => c.id === chId);
  state.currentChapter = ch;
  const e = EXPLANATIONS[chId];
  let body = '';

  if (e.cards) {
    body = `<div class="explain-cards">${e.cards.map(c => `<div class="explain-card">
      <div class="ec-icon">${c.icon}</div><div class="ec-title">${c.title}</div><div class="ec-desc">${c.desc}</div></div>`).join('')}</div>`;
  }
  if (e.code) {
    body += `<div class="explain-code"><div class="explain-code-label">${e.code.label}</div><pre class="explain-code-block">${e.code.html || e.code.text}</pre></div>`;
  }
  if (e.table) {
    body = `<div class="explain-table"><div class="et-header">
        <span class="et-h">Operator</span><span class="et-h">When to reach for it</span><span class="et-h">Decorator</span></div>
      ${e.table.map(r => `<div class="et-row">
        <span class="et-op">${r.op}</span><span class="et-when">${r.when}</span><span class="et-dec">${r.dec}</span></div>`).join('')}</div>`;
  }

  const docLink = e.doc ? `<a href="${e.doc.url}" target="_blank" rel="noopener" style="font:500 11px 'Roboto Mono',monospace;color:var(--teal);text-decoration:none;letter-spacing:.04em;display:inline-block;margin-bottom:16px;opacity:.65;transition:opacity .2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.65">${e.doc.label} ↗</a>` : '';
  document.getElementById('explain-content').innerHTML = `
    <div class="eyebrow eyebrow-gold">${e.eyebrow}</div><h2>${e.title}</h2>
    <p class="explain-sub">${e.sub}</p>${docLink}${body}
    <button class="btn btn-gold" id="btn-begin">Begin Mission</button>`;
  document.getElementById('btn-begin').addEventListener('click', () => startChapter(chId));
  showScreen('s-explain');
}

function startChapter(chId) {
  const ch = CHAPTERS.find(c => c.id === chId);
  state.currentChapter = ch;
  const ct = document.getElementById('puzzle-content'); ct.innerHTML = '';
  if (ch.type === 'terminal') renderTerminalQuiz(ct, ch);
  else if (ch.type === 'dag-builder') renderDagBuilder(ct, ch);
  else renderWiringBoard(ct, ch, ch.id);
  showScreen('s-puzzle'); updateProgress();
}

function finishChapter(chapter, chId, score, total) {
  state.chapterScores[chId] = score;
  const pct = Math.round(score / total * 100);
  document.getElementById('result-icon').textContent = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💡';
  document.getElementById('result-title').textContent = pct >= 80 ? 'Mission Complete!' : pct >= 50 ? 'Good Progress!' : 'Keep Training!';
  document.getElementById('result-msg').textContent = `${score}/${total} correct${pct >= 80 ? ' — well done.' : '. Review and try again.'}`;
  document.getElementById('stat-score').textContent = pct + '%';
  document.getElementById('stat-correct').textContent = `${score}/${total}`;
  document.getElementById('stat-module').textContent = `${CHAPTERS.findIndex(c => c.id === chId) + 1}/5`;
  const allDone = CHAPTERS.every(c => state.chapterScores[c.id] !== undefined);
  document.getElementById('btn-next-ch').textContent = allDone ? 'See Results' : 'Next Mission';
  showScreen('s-result'); burst(innerWidth / 2, innerHeight / 3, '#FFB32D', 16); updateProgress();
}

function updateProgress() {
  document.getElementById('game-prog').style.width = (Object.keys(state.chapterScores).length / CHAPTERS.length * 100) + '%';
}

// ── Event Wiring ─────────────────────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => { renderTimeline(); showScreen('s-chapters'); });
document.getElementById('back-btn').addEventListener('click', () => { renderTimeline(); showScreen('s-chapters'); });
document.getElementById('btn-next-ch').addEventListener('click', () => {
  if (CHAPTERS.every(c => state.chapterScores[c.id] !== undefined)) { showScreen('s-outro'); return; }
  const nx = CHAPTERS.find(c => !state.chapterScores[c.id]);
  nx ? showExplain(nx.id) : (renderTimeline(), showScreen('s-chapters'));
});
document.getElementById('btn-retry').addEventListener('click', () => { if (state.currentChapter) showExplain(state.currentChapter.id); });
document.getElementById('btn-replay').addEventListener('click', () => {
  state.chapterScores = {}; state.currentChapter = null;
  document.getElementById('game-prog').style.width = '0'; showScreen('s-intro');
});
document.getElementById('btn-share').addEventListener('click', () => {
  const text = encodeURIComponent("Just completed the Common AI Lab and I'm ready to productionize AI workflows with Apache Airflow and the new Common AI Provider.\n\n6 operators, 5 toolsets, structured output, human-in-the-loop, durable execution. One package for every LLM.\n\nTry it yourself and explore the interactive lab:\nhttps://vojay.io/common-ai-lab");
  window.open('https://www.linkedin.com/sharing/share-offsite/?mini=true&text=' + text, '_blank', 'width=600,height=500');
});

showScreen('s-intro');
