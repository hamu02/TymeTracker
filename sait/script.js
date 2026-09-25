const defaultGoals = [
  { title: '英語学習', targetHours: 30, doneHours: 18.5, color: '#3f7df6' },
  { title: '読書', targetHours: 12, doneHours: 8.5, color: '#32b8a6' },
  { title: 'プロジェクト改善', targetHours: 20, doneHours: 13.4, color: '#f5b84d' }
];

let goals = [...defaultGoals];

const goalForm = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const goalDate = document.getElementById('goalDate');
const calendarPanel = document.getElementById('calendarPanel');
const calendarTitle = document.getElementById('calendarTitle');
const calendarGrid = document.getElementById('calendarGrid');
const todayTaskCount = document.getElementById('todayTaskCount');
const todayTaskList = document.getElementById('todayTaskList');
let displayedMonth = new Date();

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

defaultGoals.forEach((goal, index) => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + index * 7);
  goal.date = getDateKey(dueDate);
});

function getRemainingDays(dateKey) {
  const today = new Date(`${getDateKey()}T00:00:00`);
  const dueDate = new Date(`${dateKey}T00:00:00`);
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
}

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = getDateKey();
  const goalsByDate = goals.reduce((result, goal) => {
    if (!result[goal.date]) result[goal.date] = [];
    result[goal.date].push(goal);
    return result;
  }, {});

  calendarTitle.textContent = `${year}年${month + 1}月`;
  calendarGrid.innerHTML = '';

  for (let index = 0; index < firstDay; index += 1) {
    const emptyCell = document.createElement('span');
    emptyCell.className = 'calendar-day is-empty';
    emptyCell.setAttribute('aria-hidden', 'true');
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    const dayCell = document.createElement('div');
    dayCell.className = `calendar-day${dateKey === todayKey ? ' is-today' : ''}`;
    dayCell.setAttribute('role', 'gridcell');

    const number = document.createElement('span');
    number.className = 'calendar-date';
    number.textContent = day;
    dayCell.appendChild(number);

    (goalsByDate[dateKey] || []).forEach((goal) => {
      const goalLabel = document.createElement('span');
      goalLabel.className = 'calendar-goal';
      goalLabel.style.setProperty('--goal-color', goal.color);
      goalLabel.textContent = goal.title;
      goalLabel.title = `${goal.title} (${goal.targetHours}h)`;
      dayCell.appendChild(goalLabel);

      const remainingDays = getRemainingDays(goal.date);
      const remainingLabel = document.createElement('small');
      remainingLabel.className = 'calendar-remaining';
      remainingLabel.textContent = remainingDays > 0
        ? `あと${remainingDays}日`
        : remainingDays === 0
          ? '今日が期限'
          : `${Math.abs(remainingDays)}日超過`;
      dayCell.appendChild(remainingLabel);
    });

    calendarGrid.appendChild(dayCell);
  }

  renderTodayTasks();
}

function renderTodayTasks() {
  const todayGoals = goals.filter((goal) => goal.date === getDateKey());
  todayTaskCount.textContent = `${todayGoals.length}件`;

  if (todayGoals.length === 0) {
    todayTaskList.innerHTML = '<p class="empty-task-message">今日の課題はありません。</p>';
    return;
  }

  todayTaskList.innerHTML = todayGoals
    .map((goal) => `
      <article class="today-task">
        <span class="task-marker" style="--goal-color: ${goal.color};"></span>
        <strong>${goal.title}</strong>
        <span class="task-status">今日が期限</span>
      </article>
    `)
    .join('');
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

  if (!title) {
    alert('課題名を入力してください。');
    return;
  }

  goals.push({
    title,
    targetHours: 1,
    doneHours: 0,
    date: goalDate.value || getDateKey(),
    color: ['#3f7df6', '#32b8a6', '#f5b84d'][goals.length % 3]
  });

  goalInput.value = '';
  goalDate.value = getDateKey();
  renderCalendar();
  updateDashboard();
});

document.getElementById('previousMonth').addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar();
});

function autoProgress() {
  goals = goals.map((goal) => {
    const increase = Math.random() * 0.25;
    const next = Math.min(goal.targetHours, goal.doneHours + increase);
    return { ...goal, doneHours: Number(next.toFixed(1)) };
  });

  renderCalendar();
  updateDashboard();
}

renderCalendar();
updateDashboard();
goalDate.value = getDateKey();
setInterval(autoProgress, 2500);
