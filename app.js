const STORAGE_KEY = 'questforge-lesson-v1';
const starterLesson = {
  title: 'The Solar System', subject: 'Science', grade: 'Grade 5',
  intro: 'Your mission: explore our cosmic neighborhood and discover what makes each planet unique. Ready for liftoff?',
  questions: [
    { prompt: 'Which planet is known as the Red Planet?', choices: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1 },
    { prompt: 'What is at the center of our solar system?', choices: ['Earth', 'The Moon', 'The Sun', 'Mars'], answer: 2 },
    { prompt: 'Which planet has the most visible rings?', choices: ['Saturn', 'Neptune', 'Venus', 'Earth'], answer: 0 }
  ]
};
let lesson = loadLesson();
let currentQuestion = 0;
let selectedAnswer = null;
let answered = false;
let score = 0;
let toastTimer;

function loadLesson() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length) return parsed;
    }
  } catch (error) { console.warn('Could not load saved lesson.', error); }
  return JSON.parse(JSON.stringify(starterLesson));
}
function saveLesson() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lesson)); }
  catch (error) { console.warn('Could not save lesson.', error); }
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function safeIndex(index, length) { return Math.min(Math.max(0, Number(index) || 0), Math.max(length - 1, 0)); }
function syncFields() {
  document.getElementById('lesson-title').value = lesson.title;
  document.getElementById('lesson-subject').value = lesson.subject;
  document.getElementById('lesson-grade').value = lesson.grade;
  document.getElementById('lesson-intro').value = lesson.intro;
  renderQuestions(); updatePreview();
}
function renderQuestions() {
  const list = document.getElementById('question-list');
  list.innerHTML = lesson.questions.map((question, index) => `
    <article class="question-card" data-question="${index}">
      <div class="question-heading"><span class="question-number">${String(index + 1).padStart(2, '0')}</span><span class="question-kind">Multiple choice</span><span class="question-tools"><span>✥</span><button type="button" class="remove-question" aria-label="Remove checkpoint ${index + 1}" title="Remove checkpoint">✕</button></span></div>
      <div class="question-body"><input class="question-prompt" aria-label="Checkpoint ${index + 1} question" maxlength="160" value="${escapeHTML(question.prompt)}" placeholder="Write a question for your learners...">
        <div class="answer-list">${question.choices.map((choice, choiceIndex) => `<label class="answer-row ${choiceIndex === question.answer ? 'correct' : ''}"><input type="radio" class="answer-radio" name="correct-${index}" value="${choiceIndex}" ${choiceIndex === question.answer ? 'checked' : ''} aria-label="Mark ${escapeHTML(choice)} as correct"><input class="answer-input" aria-label="Answer ${choiceIndex + 1}" maxlength="80" value="${escapeHTML(choice)}" placeholder="Answer ${choiceIndex + 1}">${choiceIndex === question.answer ? '<span class="correct-hint">✓ correct</span>' : ''}</label>`).join('')}</div>
      </div>
    </article>`).join('');
  document.getElementById('question-count').textContent = lesson.questions.length;
  document.getElementById('preview-count').textContent = lesson.questions.length;
  document.getElementById('preview-xp').textContent = lesson.questions.length * 10;
}
function updatePreview() {
  const title = lesson.title.trim() || 'Untitled quest';
  document.getElementById('top-lesson-name').textContent = title;
  document.getElementById('preview-title').textContent = title;
  document.getElementById('preview-subject').textContent = lesson.subject.toUpperCase();
  document.getElementById('preview-grade').textContent = lesson.grade.toUpperCase();
  document.getElementById('preview-intro').textContent = lesson.intro.trim() || 'A new learning adventure is waiting to begin.';
}
function markSaved() {
  saveLesson();
  const status = document.getElementById('save-status');
  status.innerHTML = '<span class="status-dot"></span> Saved just now';
  updatePreview();
}
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function setView(view) {
  document.querySelectorAll('.view').forEach(section => section.classList.remove('active-view'));
  document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  document.getElementById(`${view}-view`).classList.add('active-view');
  if (view === 'play') startGame();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function addQuestion() {
  lesson.questions.push({ prompt: '', choices: ['', '', '', ''], answer: 0 });
  renderQuestions(); markSaved();
  const prompts = document.querySelectorAll('.question-prompt');
  prompts[prompts.length - 1]?.focus();
}
function readQuestionCard(target) {
  const card = target.closest('.question-card');
  if (!card) return;
  const index = Number(card.dataset.question);
  const question = lesson.questions[index];
  if (!question) return;
  if (target.classList.contains('question-prompt')) question.prompt = target.value;
  if (target.classList.contains('answer-input')) {
    const row = target.closest('.answer-row');
    const choiceIndex = Array.from(row.parentElement.children).indexOf(row);
    question.choices[choiceIndex] = target.value;
  }
  if (target.classList.contains('answer-radio')) {
    question.answer = Number(target.value);
    renderQuestions(); markSaved(); return;
  }
  markSaved();
}
function validateLesson() {
  if (!lesson.title.trim()) return 'Add a title to your quest first.';
  if (!lesson.questions.length) return 'Add at least one checkpoint before publishing.';
  for (let i = 0; i < lesson.questions.length; i++) {
    const question = lesson.questions[i];
    if (!question.prompt.trim() || question.choices.some(choice => !choice.trim())) return `Finish the question and all four answers at checkpoint ${i + 1}.`;
  }
  return '';
}
function startGame() {
  currentQuestion = 0; selectedAnswer = null; answered = false; score = 0;
  renderGame();
}
function renderGame() {
  const wrap = document.getElementById('game-wrap');
  if (currentQuestion >= lesson.questions.length) {
    const xp = score * 10;
    wrap.innerHTML = `<div class="game-card complete-card"><div class="trophy">🏆</div><div class="eyebrow">QUEST COMPLETE</div><h1>Cosmic explorer,<br>that's a wrap!</h1><p>You made it through <strong>${lesson.questions.length} checkpoints</strong> and got <strong>${score} right</strong>. Every great learner keeps exploring.</p><div class="reward-row"><span class="reward-chip">✦ &nbsp;${xp} XP earned</span><span class="reward-chip">✓ &nbsp;${score}/${lesson.questions.length} correct</span></div><div class="complete-actions"><button class="button button-primary" id="replay-button">↻ &nbsp; Play again</button><button class="button button-secondary" id="finish-button">Back to lesson builder</button></div></div>`;
    document.getElementById('replay-button').addEventListener('click', startGame);
    document.getElementById('finish-button').addEventListener('click', () => setView('builder'));
    return;
  }
  const question = lesson.questions[currentQuestion];
  const progress = (currentQuestion / lesson.questions.length) * 100;
  wrap.innerHTML = `<div class="game-header"><button class="game-back" id="game-back" aria-label="Back to lesson builder">←</button><div class="game-progress-area"><div class="game-progress-copy"><span>Checkpoint <strong>${currentQuestion + 1}</strong> of ${lesson.questions.length}</span><span>${Math.round(progress)}% complete</span></div><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></div><div class="game-xp">✦ &nbsp;${score * 10} XP</div></div>
    <article class="game-card"><div class="game-subject">${escapeHTML(lesson.subject.toUpperCase())} &nbsp;·&nbsp; ${escapeHTML(lesson.grade.toUpperCase())}</div><h1>${escapeHTML(lesson.title)}</h1><p class="game-intro">${escapeHTML(lesson.intro)}</p><div class="mission-banner"><span class="mission-emoji">🚀</span><div><strong>Mission control says...</strong><p>Choose the best answer to continue your journey. You’ve got this!</p></div></div><div class="challenge-kicker">CHECKPOINT ${String(currentQuestion + 1).padStart(2, '0')}</div><h2 class="challenge-prompt">${escapeHTML(question.prompt)}</h2><div class="choice-list">${question.choices.map((choice, index) => {
      let state = '';
      if (answered && index === question.answer) state = 'correct';
      else if (answered && index === selectedAnswer) state = 'incorrect';
      else if (index === selectedAnswer) state = 'selected';
      return `<button class="choice-button ${state}" data-choice="${index}" ${answered ? 'disabled' : ''}><span class="choice-key">${String.fromCharCode(65 + index)}</span>${escapeHTML(choice)}</button>`;
    }).join('')}</div><div id="answer-feedback" class="feedback-box ${answered ? `show ${selectedAnswer === question.answer ? 'good' : 'try-again'}` : ''}">${answered ? (selectedAnswer === question.answer ? '✨ That’s right! Great work, explorer.' : `Not quite! The correct answer is <strong>${escapeHTML(question.choices[question.answer])}</strong>. Keep going—you’re learning!`) : ''}</div><div class="game-footer"><span class="game-footer-note">${answered ? (selectedAnswer === question.answer ? 'Checkpoint cleared · +10 XP' : 'Checkpoint complete · keep learning') : 'Pick an answer to unlock the next checkpoint.'}</span><button id="continue-button" class="button button-continue ${answered ? 'ready' : ''}" ${answered ? '' : 'disabled'}>${currentQuestion === lesson.questions.length - 1 ? 'Finish quest' : 'Continue'} &nbsp;→</button></div></article>`;
  document.getElementById('game-back').addEventListener('click', () => setView('builder'));
  wrap.querySelectorAll('.choice-button').forEach(button => button.addEventListener('click', () => chooseAnswer(Number(button.dataset.choice))));
  document.getElementById('continue-button').addEventListener('click', nextQuestion);
}
function chooseAnswer(index) {
  if (answered) return;
  selectedAnswer = index;
  answered = true;
  if (index === lesson.questions[currentQuestion].answer) score++;
  renderGame();
}
function nextQuestion() {
  if (!answered) return;
  currentQuestion++;
  selectedAnswer = null;
  answered = false;
  renderGame();
}

document.querySelectorAll('.nav-link').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.getElementById('lesson-title').addEventListener('input', event => { lesson.title = event.target.value; markSaved(); });
document.getElementById('lesson-subject').addEventListener('change', event => { lesson.subject = event.target.value; markSaved(); });
document.getElementById('lesson-grade').addEventListener('change', event => { lesson.grade = event.target.value; markSaved(); });
document.getElementById('lesson-intro').addEventListener('input', event => { lesson.intro = event.target.value; markSaved(); });
document.getElementById('question-list').addEventListener('input', event => readQuestionCard(event.target));
document.getElementById('question-list').addEventListener('change', event => readQuestionCard(event.target));
document.getElementById('question-list').addEventListener('click', event => {
  const button = event.target.closest('.remove-question');
  if (!button) return;
  if (lesson.questions.length === 1) { showToast('A quest needs at least one checkpoint.'); return; }
  const index = Number(button.closest('.question-card').dataset.question);
  lesson.questions.splice(index, 1);
  renderQuestions(); markSaved(); showToast('Checkpoint removed.');
});
document.getElementById('add-question').addEventListener('click', addQuestion);
document.getElementById('publish-button').addEventListener('click', () => {
  const issue = validateLesson();
  if (issue) { showToast(issue); return; }
  markSaved(); showToast('Quest published! It’s ready for your students.');
});
document.getElementById('preview-play').addEventListener('click', () => setView('play'));
document.getElementById('back-to-builder').addEventListener('click', () => setView('builder'));
syncFields();
