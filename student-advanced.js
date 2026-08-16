(() => {
  const STORAGE_KEY = 'msvl_student_advanced_v1';

  const SUBJECTS = ['Data Structures', 'OOP', 'Calculus', 'Physics', 'English', 'Problem Solving'];
  const DIFFICULTIES = ['Starter', 'Core', 'Advanced'];

  const QUEST_TEMPLATES = [
    'Solve {n} mixed MCQs on {subject}',
    'Write concise notes for {subject} topic #{n}',
    'Complete {n} flashcards in {subject}',
    'Review yesterday mistakes from {subject}',
    'Summarize one lecture from {subject}',
    'Practice timed quiz ({n} min) in {subject}',
    'Teach-back challenge: explain {subject} concept #{n}',
    'Solve one previous-year {subject} problem set',
    'Do one revision sprint for {subject}',
    'Create {n} memory anchors for {subject}'
  ];

  const SKILL_BASE = {
    'Data Structures': 62,
    'OOP': 58,
    'Calculus': 49,
    'Physics': 52,
    'English': 69,
    'Problem Solving': 56
  };

  const ARCADE_LOGIC_BANK = [
    { q: 'Best average complexity for comparison sorting?', o: ['O(n²)', 'O(n log n)', 'O(log n)', 'O(1)'], a: 1 },
    { q: 'Queue follows which order?', o: ['LIFO', 'FIFO', 'Random', 'Sorted'], a: 1 },
    { q: 'BST inorder traversal output?', o: ['Random', 'Reverse sorted', 'Sorted', 'Level wise'], a: 2 },
    { q: 'Encapsulation primarily protects?', o: ['CPU', 'Data', 'Network', 'Compiler'], a: 1 },
    { q: 'Derivative gives?', o: ['Area', 'Rate of change', 'Limit only', 'Integral inverse only'], a: 1 }
  ];

  const state = loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        questDone: raw.questDone || {},
        xp: raw.xp || 2840,
        streak: raw.streak || 12,
        dailyFocusMins: raw.dailyFocusMins || 95,
        plannerSeed: raw.plannerSeed || Date.now(),
        arcadeBest: raw.arcadeBest || { logic: 0, memory: 0, sprint: 0 },
        logic: raw.logic || { idx: 0, score: 0, active: false },
        memory: raw.memory || { sequence: [], step: 0, level: 1, showing: false, active: false },
        sprint: raw.sprint || { target: '', timeLeft: 20, score: 0, active: false }
      };
    } catch {
      return {
        questDone: {},
        xp: 2840,
        streak: 12,
        dailyFocusMins: 95,
        plannerSeed: Date.now(),
        arcadeBest: { logic: 0, memory: 0, sprint: 0 },
        logic: { idx: 0, score: 0, active: false },
        memory: { sequence: [], step: 0, level: 1, showing: false, active: false },
        sprint: { target: '', timeLeft: 20, score: 0, active: false }
      };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function buildQuestPool() {
    const pool = [];
    let id = 1;
    SUBJECTS.forEach((subject, sIdx) => {
      DIFFICULTIES.forEach((difficulty, dIdx) => {
        QUEST_TEMPLATES.forEach((tpl, tIdx) => {
          for (let rep = 1; rep <= 3; rep++) {
            const n = 5 + ((sIdx + dIdx + tIdx + rep) % 16);
            const xp = 15 + dIdx * 15 + rep * 4;
            pool.push({
              id: id++,
              subject,
              difficulty,
              xp,
              title: tpl.replace('{subject}', subject).replace('{n}', n),
              estMins: 8 + ((id + tIdx) % 18)
            });
          }
        });
      });
    });
    return pool;
  }

  const QUEST_POOL = buildQuestPool(); // 540 quests

  function doneCount() {
    return Object.keys(state.questDone).length;
  }

  function completionPct() {
    return Math.round((doneCount() / QUEST_POOL.length) * 100);
  }

  function masteryBySubject() {
    const by = {};
    SUBJECTS.forEach(s => {
      const total = QUEST_POOL.filter(q => q.subject === s).length;
      const done = QUEST_POOL.filter(q => q.subject === s && state.questDone[q.id]).length;
      by[s] = Math.min(98, SKILL_BASE[s] + Math.round((done / total) * 38));
    });
    return by;
  }

  function uiToast(title, msg = '', type = 'info') {
    window.toast?.(title, msg, type);
  }

  function renderLearningLab() {
    const stats = document.getElementById('advLabStats');
    const plan = document.getElementById('advPlanList');
    const rev = document.getElementById('advRevisionBoard');
    const weak = document.getElementById('advWeaknessList');
    const sug = document.getElementById('advSuggestionList');
    if (!stats || !plan || !rev || !weak || !sug) return;

    const mastery = masteryBySubject();
    const sortedWeak = Object.entries(mastery).sort((a, b) => a[1] - b[1]).slice(0, 3);

    stats.innerHTML = `
      <div class="adv-stat"><div class="k">Total XP</div><div class="v text-accent">${state.xp.toLocaleString()}</div><div class="s">Learning score +${completionPct()}% quest completion</div></div>
      <div class="adv-stat"><div class="k">Current Streak</div><div class="v text-amber">🔥 ${state.streak}</div><div class="s">Consistency unlocks bonus missions</div></div>
      <div class="adv-stat"><div class="k">Focus Minutes (Today)</div><div class="v text-teal">${state.dailyFocusMins}m</div><div class="s">Target: 120m daily deep work</div></div>`;

    const planItems = generatePlanItems();
    plan.innerHTML = planItems.map((p, i) => `
      <div class="adv-plan-item">
        <div class="adv-plan-dot" style="background:${i === 0 ? 'var(--red)' : i === 1 ? 'var(--amber)' : 'var(--green)'};"></div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;">${p.title}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${p.desc}</div>
          <div class="flex gap-6 mt-6">
            <span class="adv-chip">${p.mins} mins</span>
            <span class="adv-chip">${p.subject}</span>
            <span class="adv-chip">+${p.xp} XP</span>
          </div>
        </div>
      </div>`).join('');

    const revBuckets = [
      { name: 'Today', color: 'var(--accent)', count: 7 },
      { name: '1 Day', color: 'var(--teal)', count: 11 },
      { name: '3 Days', color: 'var(--amber)', count: 15 },
      { name: '7 Days', color: 'var(--purple)', count: 9 }
    ];
    rev.innerHTML = `<div class="adv-rev-grid">${revBuckets.map(b => `
      <div class="adv-rev-card">
        <div class="flex items-center justify-between mb-6">
          <strong style="font-size:12px;">${b.name}</strong>
          <span class="adv-pill" style="border-color:${b.color};color:${b.color};">${b.count} cards</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${Math.min(100, b.count * 7)}%;background:${b.color};"></div></div>
      </div>`).join('')}</div>`;

    weak.innerHTML = sortedWeak.map(([name, score]) => `
      <div class="mb-10" style="padding:10px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg-surface);">
        <div class="flex items-center justify-between">
          <strong style="font-size:12px;">${name}</strong>
          <span style="font-size:12px;color:var(--red);font-weight:700;">${score}%</span>
        </div>
        <div class="progress mt-6"><div class="progress-bar" style="width:${score}%;background:var(--red);"></div></div>
      </div>`).join('');

    sug.innerHTML = [
      'Start with 20-minute weak-topic sprint before social feed.',
      'Attempt one timed quest after each class lecture.',
      'Use teach-back mode for concepts scoring below 60%.',
      'Pair flashcards with Pomodoro session for better retention.'
    ].map(s => `<div style="font-size:12px;border-bottom:1px solid var(--border);padding:8px 0;">• ${s}</div>`).join('');
  }

  function generatePlanItems() {
    const seed = new Date().getDate();
    const mastery = masteryBySubject();
    const weakFirst = Object.entries(mastery).sort((a, b) => a[1] - b[1]).map(([s]) => s);
    return [
      { title: 'Deep Focus Sprint', subject: weakFirst[0], mins: 30, xp: 35, desc: `Target weakest skill: ${weakFirst[0]} with active recall.` },
      { title: 'Timed Quiz Drill', subject: weakFirst[1], mins: 20, xp: 22, desc: `10 mixed MCQs from ${weakFirst[1]} with review mode.` },
      { title: 'Revision Capsule', subject: weakFirst[2], mins: 18, xp: 18, desc: `Spaced repetition deck + mistake correction.` },
      { title: 'Challenge Quest', subject: SUBJECTS[seed % SUBJECTS.length], mins: 25, xp: 28, desc: 'Unlock streak booster by finishing advanced mission.' }
    ];
  }

  function renderQuestArena() {
    const subjectFilterEl = document.getElementById('qaSubjectFilter');
    const diffFilterEl = document.getElementById('qaDifficultyFilter');
    const stats = document.getElementById('qaStats');
    const grid = document.getElementById('qaQuestGrid');
    const progressText = document.getElementById('qaProgressText');
    const progressBar = document.getElementById('qaProgressBar');
    if (!subjectFilterEl || !diffFilterEl || !stats || !grid || !progressText || !progressBar) return;

    if (!subjectFilterEl.options.length) {
      subjectFilterEl.innerHTML = ['All Subjects', ...SUBJECTS].map(s => `<option value="${s}">${s}</option>`).join('');
    }
    if (!diffFilterEl.options.length) {
      diffFilterEl.innerHTML = ['All Levels', ...DIFFICULTIES].map(d => `<option value="${d}">${d}</option>`).join('');
    }

    const sf = subjectFilterEl.value || 'All Subjects';
    const df = diffFilterEl.value || 'All Levels';

    const filtered = QUEST_POOL.filter(q =>
      (sf === 'All Subjects' || q.subject === sf) &&
      (df === 'All Levels' || q.difficulty === df)
    );

    const completed = filtered.filter(q => state.questDone[q.id]).length;

    stats.innerHTML = `
      <div class="adv-stat"><div class="k">Quest Library</div><div class="v">${QUEST_POOL.length}</div><div class="s">Generated missions ready</div></div>
      <div class="adv-stat"><div class="k">Completed</div><div class="v text-green">${doneCount()}</div><div class="s">Across all tracks</div></div>
      <div class="adv-stat"><div class="k">Reward XP Earned</div><div class="v text-amber">${state.xp.toLocaleString()}</div><div class="s">Keep streak alive for boost</div></div>`;

    const pct = filtered.length ? Math.round((completed / filtered.length) * 100) : 0;
    progressText.textContent = `${completed} / ${filtered.length} completed`;
    progressBar.style.width = `${pct}%`;

    grid.innerHTML = filtered.slice(0, 60).map(q => {
      const done = !!state.questDone[q.id];
      return `
      <div class="adv-quest-card ${done ? 'done' : ''}">
        <div class="flex items-center justify-between mb-8">
          <span class="adv-pill">${q.subject}</span>
          <span class="adv-pill">${q.difficulty}</span>
        </div>
        <div style="font-size:13px;font-weight:600;line-height:1.4;">${q.title}</div>
        <div class="flex items-center justify-between mt-10">
          <span style="font-size:11px;color:var(--text-muted);">⏱ ${q.estMins}m · +${q.xp} XP</span>
          <button class="btn ${done ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleQuestDone(${q.id})">${done ? 'Completed' : 'Complete'}</button>
        </div>
      </div>`;
    }).join('');
  }

  function toggleQuestDone(id) {
    if (state.questDone[id]) {
      delete state.questDone[id];
      state.xp = Math.max(0, state.xp - 20);
      uiToast('Quest reverted', 'Progress updated', 'info');
    } else {
      state.questDone[id] = true;
      const q = QUEST_POOL.find(x => x.id === id);
      state.xp += q ? q.xp : 20;
      uiToast('Quest complete! 🎉', `+${q ? q.xp : 20} XP earned`, 'success');
    }
    saveState();
    renderQuestArena();
    renderLearningLab();
    renderSkillRadar();
  }

  function renderSkillRadar() {
    const map = document.getElementById('srMasteryMap');
    const feed = document.getElementById('srGrowthFeed');
    const actions = document.getElementById('srActions');
    const milestones = document.getElementById('srMilestones');
    if (!map || !feed || !actions || !milestones) return;

    const mastery = masteryBySubject();
    map.innerHTML = Object.entries(mastery).map(([subject, score]) => `
      <div class="adv-skill-row">
        <div class="flex items-center justify-between mb-4">
          <span style="font-size:12px;font-weight:500;">${subject}</span>
          <span style="font-size:12px;color:${score >= 70 ? 'var(--green)' : score >= 55 ? 'var(--amber)' : 'var(--red)'};font-weight:700;">${score}%</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${score}%;background:${score >= 70 ? 'var(--green)' : score >= 55 ? 'var(--amber)' : 'var(--red)'};"></div></div>
      </div>`).join('');

    const growthEvents = [
      `+2% in Data Structures after completing retrieval quests.`,
      `Quiz accuracy improved by 6% in OOP this week.`,
      `Pomodoro-linked revision sessions increased consistency.`,
      `Flashcard retention band moved from 54% to 63%.`
    ];
    feed.innerHTML = growthEvents.map((g, i) => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">Day ${i + 1} · ${g}</div>`).join('');

    const weak = Object.entries(mastery).sort((a, b) => a[1] - b[1]).slice(0, 3);
    actions.innerHTML = weak.map(([s, score]) => `
      <div style="padding:10px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg-surface);margin-bottom:8px;">
        <div class="flex items-center justify-between">
          <strong style="font-size:12px;">${s}</strong>
          <span class="badge badge-red">${score}%</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Run 2 core quests + 1 timed drill today.</div>
      </div>`).join('');

    const ms = [
      { name: '100 Quests Completed', v: Math.min(100, Math.round((doneCount() / 100) * 100)) },
      { name: 'Mastery > 70% in 3 Subjects', v: Math.min(100, Math.round((Object.values(mastery).filter(v => v >= 70).length / 3) * 100)) },
      { name: 'XP 5,000 Club', v: Math.min(100, Math.round((state.xp / 5000) * 100)) }
    ];
    milestones.innerHTML = ms.map(m => `
      <div style="margin-bottom:10px;">
        <div class="flex items-center justify-between mb-4"><span style="font-size:12px;">${m.name}</span><span style="font-size:11px;color:var(--text-muted);">${m.v}%</span></div>
        <div class="progress"><div class="progress-bar" style="width:${m.v}%;"></div></div>
      </div>`).join('');
  }

  function renderStudyArcade() {
    const menu = document.getElementById('saMenu');
    const area = document.getElementById('saPlayArea');
    if (!menu || !area) return;

    menu.innerHTML = [
      { id: 'logic', icon: '🧩', name: 'Logic Blitz', desc: 'Rapid-fire reasoning quiz', xp: '+60 XP run' },
      { id: 'memory', icon: '🧠', name: 'Pattern Memory', desc: 'Recall growing symbol sequence', xp: '+50 XP run' },
      { id: 'sprint', icon: '⌨️', name: 'Concept Sprint', desc: 'Type concepts before timer ends', xp: '+40 XP run' }
    ].map(g => `
      <div class="adv-arcade-card" onclick="startStudyArcade('${g.id}')">
        <div style="font-size:32px;">${g.icon}</div>
        <div style="font-size:14px;font-weight:700;margin-top:6px;">${g.name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${g.desc}</div>
        <div style="font-size:11px;color:var(--amber);margin-top:8px;">${g.xp}</div>
      </div>`).join('');

    area.style.display = 'none';
  }

  function startStudyArcade(mode) {
    const area = document.getElementById('saPlayArea');
    if (!area) return;
    area.style.display = 'block';

    if (mode === 'logic') {
      state.logic = { idx: 0, score: 0, active: true };
      renderLogicRound();
    }

    if (mode === 'memory') {
      state.memory = { sequence: [], step: 0, level: 1, showing: false, active: true };
      nextMemoryLevel();
    }

    if (mode === 'sprint') {
      state.sprint = { target: randomSprintWord(), timeLeft: 20, score: 0, active: true };
      renderSprint();
      runSprintTimer();
    }
  }

  function renderLogicRound() {
    const area = document.getElementById('saPlayArea');
    const q = ARCADE_LOGIC_BANK[state.logic.idx % ARCADE_LOGIC_BANK.length];
    area.innerHTML = `
      <div class="flex items-center justify-between mb-12">
        <h3>Logic Blitz</h3>
        <span class="badge badge-accent">Score: ${state.logic.score}</span>
      </div>
      <div class="q-card">
        <div class="q-text">${q.q}</div>
        <div class="adv-answer-grid">
          ${q.o.map((opt, i) => `<button class="q-opt" onclick="answerLogic(${i})">${String.fromCharCode(65 + i)}. ${opt}</button>`).join('')}
        </div>
      </div>
      <div class="mt-12"><button class="btn btn-ghost btn-sm" onclick="renderStudyArcade()">Back to Arcade Menu</button></div>`;
  }

  function answerLogic(i) {
    const q = ARCADE_LOGIC_BANK[state.logic.idx % ARCADE_LOGIC_BANK.length];
    if (i === q.a) state.logic.score += 1;
    state.logic.idx += 1;
    if (state.logic.idx >= 8) {
      const gained = state.logic.score * 8;
      state.xp += gained;
      state.arcadeBest.logic = Math.max(state.arcadeBest.logic, state.logic.score);
      saveState();
      uiToast('Logic Blitz Complete', `Score ${state.logic.score}/8 · +${gained} XP`, 'success');
      renderStudyArcade();
      renderLearningLab();
      return;
    }
    renderLogicRound();
  }

  function nextMemoryLevel() {
    const symbols = ['◆', '●', '■', '▲', '★', '✦'];
    state.memory.sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
    state.memory.step = 0;
    renderMemory();
  }

  function renderMemory(showOnly = true) {
    const area = document.getElementById('saPlayArea');
    const seq = state.memory.sequence.join(' ');
    area.innerHTML = `
      <div class="flex items-center justify-between mb-12">
        <h3>Pattern Memory</h3>
        <span class="badge badge-teal">Level ${state.memory.level}</span>
      </div>
      <div class="card text-center mb-12">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">${showOnly ? 'Memorize sequence' : 'Repeat sequence'}</div>
        <div style="font-size:34px;letter-spacing:8px;">${showOnly ? seq : '• • • •'}</div>
      </div>
      <div class="adv-answer-grid">
        ${['◆', '●', '■', '▲', '★', '✦'].map(s => `<button class="q-opt" onclick="inputMemory('${s}')">${s}</button>`).join('')}
      </div>
      <div class="mt-12"><button class="btn btn-ghost btn-sm" onclick="renderStudyArcade()">Back to Arcade Menu</button></div>`;

    if (showOnly) {
      setTimeout(() => renderMemory(false), 1400);
    }
  }

  function inputMemory(symbol) {
    const expected = state.memory.sequence[state.memory.step];
    if (symbol === expected) {
      state.memory.step += 1;
      if (state.memory.step >= state.memory.sequence.length) {
        state.memory.level += 1;
        if (state.memory.level > 6) {
          const gained = 50;
          state.xp += gained;
          state.arcadeBest.memory = Math.max(state.arcadeBest.memory, 6);
          saveState();
          uiToast('Pattern Memory Complete', `Perfect run · +${gained} XP`, 'success');
          renderStudyArcade();
          renderLearningLab();
          return;
        }
        nextMemoryLevel();
      }
    } else {
      uiToast('Sequence broke', 'Try again from level 1', 'warning');
      state.memory = { sequence: [], step: 0, level: 1, showing: false, active: true };
      nextMemoryLevel();
    }
  }

  function randomSprintWord() {
    const words = ['algorithm', 'encapsulation', 'polymorphism', 'integral', 'recursion', 'abstraction', 'queue', 'compiler'];
    return words[Math.floor(Math.random() * words.length)];
  }

  function renderSprint() {
    const area = document.getElementById('saPlayArea');
    area.innerHTML = `
      <div class="flex items-center justify-between mb-12">
        <h3>Concept Sprint</h3>
        <div class="flex gap-8">
          <span class="badge badge-amber">${state.sprint.timeLeft}s</span>
          <span class="badge badge-accent">Score: ${state.sprint.score}</span>
        </div>
      </div>
      <div class="card text-center mb-12">
        <div style="font-size:11px;color:var(--text-muted);">Type this concept fast</div>
        <div style="font-size:30px;font-weight:700;color:var(--accent);margin-top:8px;">${state.sprint.target}</div>
      </div>
      <div class="flex gap-8">
        <input class="input" id="sprintInput" placeholder="Type and press Enter" onkeydown="sprintKey(event)"/>
        <button class="btn btn-primary" onclick="submitSprintWord()">Submit</button>
      </div>
      <div class="mt-12"><button class="btn btn-ghost btn-sm" onclick="renderStudyArcade()">Back to Arcade Menu</button></div>`;
    document.getElementById('sprintInput')?.focus();
  }

  let sprintTimer = null;
  function runSprintTimer() {
    clearInterval(sprintTimer);
    sprintTimer = setInterval(() => {
      state.sprint.timeLeft -= 1;
      if (state.sprint.timeLeft <= 0) {
        clearInterval(sprintTimer);
        finishSprint();
      } else {
        renderSprint();
      }
    }, 1000);
  }

  function sprintKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSprintWord();
    }
  }

  function submitSprintWord() {
    const input = document.getElementById('sprintInput');
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    if (val === state.sprint.target) {
      state.sprint.score += 1;
      state.sprint.target = randomSprintWord();
      renderSprint();
    } else {
      input.select();
    }
  }

  function finishSprint() {
    const gained = state.sprint.score * 6;
    state.xp += gained;
    state.arcadeBest.sprint = Math.max(state.arcadeBest.sprint, state.sprint.score);
    saveState();
    uiToast('Concept Sprint Complete', `Score ${state.sprint.score} · +${gained} XP`, 'success');
    renderStudyArcade();
    renderLearningLab();
  }

  function advGenerateStudyPlan() {
    state.plannerSeed = Date.now();
    saveState();
    renderLearningLab();
    uiToast('Fresh plan generated', 'Adaptive plan aligned with weak areas', 'success');
  }

  function initStudentAdvanced() {
    renderLearningLab();
    renderQuestArena();
    renderSkillRadar();
    renderStudyArcade();
  }

  window.renderLearningLab = renderLearningLab;
  window.renderQuestArena = renderQuestArena;
  window.renderSkillRadar = renderSkillRadar;
  window.renderStudyArcade = renderStudyArcade;
  window.toggleQuestDone = toggleQuestDone;
  window.startStudyArcade = startStudyArcade;
  window.answerLogic = answerLogic;
  window.inputMemory = inputMemory;
  window.sprintKey = sprintKey;
  window.submitSprintWord = submitSprintWord;
  window.advGenerateStudyPlan = advGenerateStudyPlan;
  window.initStudentAdvanced = initStudentAdvanced;
})();
