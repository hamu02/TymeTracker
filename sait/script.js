const defaultGoals = [
  { title: '英語学習', targetHours: 30, doneHours: 18.5, color: '#3f7df6' },
  { title: '読書', targetHours: 12, doneHours: 8.5, color: '#32b8a6' },
  { title: 'プロジェクト改善', targetHours: 20, doneHours: 13.4, color: '#f5b84d' }
];

let goals = [...defaultGoals];

const goalForm = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const goalHours = document.getElementById('goalHours');
const goalList = document.getElementById('goalList');
const progressList = document.getElementById('progressList');
const reflectionChart = document.getElementById('reflectionChart');
const chartSummary = document.getElementById('chartSummary');

function calculateProgress(done, target) {
  return Math.min(100, Math.round((done / target) * 100));
}

function renderGoals() {
  goalList.innerHTML = goals
    .map((goal) => {
      const progress = calculateProgress(goal.doneHours, goal.targetHours);
      return `
        <article class="goal-item">
          <div class="goal-head">
            <h3 class="goal-title">${goal.title}</h3>
            <span class="goal-badge">${progress}%</span>
          </div>
          <div class="goal-meta">${goal.doneHours}h / ${goal.targetHours}h</div>
          <div class="progress-line">
            <div class="progress-bar" style="width: ${progress}%; background: linear-gradient(90deg, ${goal.color}, #9ec3ff);"></div>
          </div>
          <div class="goal-footer">
            <span>進行中</span>
            <span>${goal.targetHours - goal.doneHours}h 残り</span>
          </div>
        </article>
      `;
    })
    .join('');

  progressList.innerHTML = goals
    .map((goal) => {
      const progress = calculateProgress(goal.doneHours, goal.targetHours);
      return `
        <article class="goal-item">
          <div class="goal-head">
            <h3 class="goal-title">${goal.title}</h3>
            <span class="goal-badge">${progress}%</span>
          </div>
          <div class="goal-meta">現在の状態: ${goal.doneHours}h / ${goal.targetHours}h</div>
          <div class="progress-line">
            <div class="progress-bar" style="width: ${progress}%; background: linear-gradient(90deg, ${goal.color}, #a7d8ff);"></div>
          </div>
          <div class="goal-footer">
            <span>更新中</span>
            <span>${progress >= 100 ? '完了' : '継続中'}</span>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderReflectionChart(totalProgress) {
  const chartItems = [
    { label: '継続率', value: Math.min(100, totalProgress + 10), color: '#3f7df6' },
    { label: '集中度', value: Math.min(100, totalProgress + 6), color: '#32b8a6' },
    { label: '達成感', value: Math.min(100, totalProgress + 12), color: '#f5b84d' }
  ];

  if (!reflectionChart) {
    return;
  }

  reflectionChart.innerHTML = chartItems
    .map((item) => `
      <div class="bar-row">
        <span class="bar-label">${item.label}</span>
        <div class="bar-track" aria-label="${item.label} ${item.value}%">
          <div class="bar-fill" style="width: ${item.value}%; background: ${item.color};"></div>
        </div>
      </div>
    `)
    .join('');

  if (chartSummary) {
    chartSummary.textContent = totalProgress >= 80
      ? '良いペース'
      : totalProgress >= 60
        ? '順調'
        : '改善余地あり';
  }
}

function updateDashboard() {
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetHours, 0);
  const totalDone = goals.reduce((sum, goal) => sum + goal.doneHours, 0);
  const totalProgress = Math.min(100, Math.round((totalDone / totalTarget) * 100));
  const remaining = Math.max(0, totalTarget - totalDone);

  document.getElementById('metricRate').textContent = `${totalProgress}%`;
  document.getElementById('metricHours').textContent = `${totalDone.toFixed(1)}h`;
  document.getElementById('metricNext').textContent = `${Math.max(0, remaining).toFixed(1)}h`;
  document.getElementById('ringValue').textContent = `${totalProgress}%`;
  document.getElementById('totalRing').style.setProperty('--value', totalProgress);
  document.getElementById('totalHours').textContent = `${totalDone.toFixed(1)}h`;
  document.getElementById('remainingHours').textContent = `${remaining.toFixed(1)}h`;
  document.getElementById('weeklyCount').textContent = `${Math.max(1, Math.round(totalProgress / 20))}回`;

  renderReflectionChart(totalProgress);

  const goodText = totalProgress >= 70
    ? '目標に対して十分なペースで進んでおり、継続が安定しています。'
    : '少しペースを上げると、計画通り進められます。';
  const learningText = totalProgress >= 70
    ? '毎日の短時間の積み重ねが成果につながっています。次も同じリズムを保ちましょう。'
    : '学習時間を少し増やすと、達成率が一気に上がります。';
  const nextText = totalProgress >= 70
    ? '次の週は、難しいテーマを 1 つ絞って深掘りして結果を確認しましょう。'
    : '今日の残り時間を使って、最優先のタスクをこなすと効果的です。';

  document.getElementById('goodPoint').textContent = goodText;
  document.getElementById('learningPoint').textContent = learningText;
  document.getElementById('nextAction').textContent = nextText;

  const status = totalProgress >= 80
    ? 'かなり良いペースです。次のステップも自信を持って進められます。'
    : totalProgress >= 60
      ? '順調に進んでいます。引き続き継続がカギです。'
      : 'まだ途中ですが、少しずつ前に進んでいます。';

  document.getElementById('statusText').textContent = status;
}

goalForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const title = goalInput.value.trim();
  const hours = Number(goalHours.value);

  if (!title || !hours || hours <= 0) {
    alert('目標名と目標時間を正しく入力してください。');
    return;
  }

  goals.push({
    title,
    targetHours: hours,
    doneHours: 0,
    color: ['#3f7df6', '#32b8a6', '#f5b84d'][goals.length % 3]
  });

  goalInput.value = '';
  goalHours.value = '';
  renderGoals();
  updateDashboard();
});

function autoProgress() {
  goals = goals.map((goal) => {
    const increase = Math.random() * 0.25;
    const next = Math.min(goal.targetHours, goal.doneHours + increase);
    return { ...goal, doneHours: Number(next.toFixed(1)) };
  });

  renderGoals();
  updateDashboard();
}

renderGoals();
updateDashboard();
setInterval(autoProgress, 2500);
