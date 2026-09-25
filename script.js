const defaultGoals = [
  { id: 1, name: '毎日30分の運動', type: '健康', deadline: '2026-10-02', progress: 80, done: false },
  { id: 2, name: '週次レポート提出', type: '仕事', deadline: '2026-09-30', progress: 60, done: false },
  { id: 3, name: '英語学習3回', type: '学習', deadline: '2026-10-04', progress: 100, done: true },
  { id: 4, name: '睡眠時間を7時間確保', type: '生活', deadline: '2026-10-01', progress: 70, done: false }
];

const goalList = document.getElementById('goalList');
const goalForm = document.getElementById('goalForm');
const goalName = document.getElementById('goalName');
const goalType = document.getElementById('goalType');
const goalDeadline = document.getElementById('goalDeadline');

let goals = [...defaultGoals];

function formatDate(dateString) {
  if (!dateString) return '期限なし';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  }).format(date);
}

function renderGoals() {
  goalList.innerHTML = '';

  if (!goals.length) {
    goalList.innerHTML = '<p class="empty-state">まだ目標がありません。新しい目標を追加してください。</p>';
    return;
  }

  goals.forEach((goal) => {
    const card = document.createElement('article');
    card.className = `goal-card ${goal.done ? 'is-done' : ''}`;

    card.innerHTML = `
      <div class="goal-top">
        <h4>${goal.name}</h4>
        <span class="goal-type">${goal.type}</span>
      </div>
      <div class="goal-meta">
        <span>期限: ${formatDate(goal.deadline)}</span>
        <span>${goal.progress}%</span>
      </div>
      <div class="progress-track" aria-label="進捗">
        <div class="progress-bar" style="--progress: ${goal.progress}%"></div>
      </div>
      <div class="goal-actions">
        <button class="goal-button complete" type="button" data-action="toggle" data-id="${goal.id}">
          ${goal.done ? '未達成に戻す' : '完了にする'}
        </button>
        <button class="goal-button delete" type="button" data-action="delete" data-id="${goal.id}">削除</button>
      </div>
    `;

    goalList.appendChild(card);
  });

  updateSummary();
}

function updateSummary() {
  const completed = goals.filter((goal) => goal.done).length;
  const active = goals.filter((goal) => !goal.done).length;
  const progress = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0;

  document.getElementById('overallProgress').textContent = `${progress}%`;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('activeCount').textContent = active;
  document.getElementById('achievementRate').textContent = `${progress}%`;
  document.getElementById('remainingGoals').textContent = `${active}件`;
  document.getElementById('totalTasks').textContent = goals.length * 3;

  const ring = document.querySelector('.ring');
  ring.style.background = `conic-gradient(var(--primary) 0 ${progress}%, #eaf1ff ${progress}% 100%)`;
}

function addGoal(event) {
  event.preventDefault();

  const name = goalName.value.trim();
  const type = goalType.value;
  const deadline = goalDeadline.value;
  if (!name) return;

  goals.unshift({
    id: Date.now(),
    name,
    type,
    deadline,
    progress: 20,
    done: false
  });

  goalForm.reset();
  renderGoals();
}

function handleGoalAction(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, id } = button.dataset;
  const targetId = Number(id);

  if (action === 'toggle') {
    goals = goals.map((goal) => {
      if (goal.id === targetId) {
        const nextProgress = goal.done ? 70 : 100;
        return { ...goal, done: !goal.done, progress: nextProgress };
      }
      return goal;
    });
  }

  if (action === 'delete') {
    goals = goals.filter((goal) => goal.id !== targetId);
  }

  renderGoals();
}

goalForm.addEventListener('submit', addGoal);
goalList.addEventListener('click', handleGoalAction);

document.getElementById('focusToggle').addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');
});

renderGoals();
