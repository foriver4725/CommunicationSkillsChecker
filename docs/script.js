const DIAGNOSIS_DATA = {
  title: "コミュニケーションの苦手ポイント診断",
  likertScale: [
    { value: 1, label: "全く当てはまらない" },
    { value: 2, label: "あまり当てはまらない" },
    { value: 3, label: "どちらともいえない" },
    { value: 4, label: "やや当てはまる" },
    { value: 5, label: "とても当てはまる" },
  ],
  axes: [
    { id: "context", label: "社会コンテキスト", description: "相手・場・空気の読み取り" },
    { id: "emotion", label: "感情", description: "緊張や不安の影響" },
    { id: "topic", label: "話題生成", description: "何を話すか思いつく力" },
    { id: "response", label: "応答", description: "相手の話への返し" },
    { id: "structure", label: "構成", description: "順序立てて話す力" },
    { id: "expression", label: "表現", description: "言葉に変換して伝える力" },
    { id: "timing", label: "タイミング", description: "話し始める・入る感覚" },
    { id: "experience", label: "経験", description: "慣れ・成功体験・自己効力感" },
  ],
  questions: [
    { id: "q01", text: "相手や場の雰囲気を見て、どう振る舞うべきか判断できる。", axisWeights: { context: 1 }, reverse: true },
    { id: "q02", text: "相手が雑談をしたいのか、結論を求めているのかを感じ取れる。", axisWeights: { context: 1 }, reverse: true },
    { id: "q03", text: "会話が始まる前から、強い緊張や不安を感じることが多い。", axisWeights: { emotion: 1 } },
    { id: "q04", text: "初対面や目上の相手だと、頭が真っ白になりやすい。", axisWeights: { emotion: 0.7, context: 0.3 } },
    { id: "q05", text: "会話の中で、何を話題にすればよいか思いつかないことが多い。", axisWeights: { topic: 1 } },
    { id: "q06", text: "会話を広げるためのネタを自然に思いつける。", axisWeights: { topic: 1 }, reverse: true },
    { id: "q07", text: "相手の話に対して、何を返せばいいか迷うことが多い。", axisWeights: { response: 1 } },
    { id: "q08", text: "相手の発言に対して、自然に質問や返答を思いつける。", axisWeights: { response: 1 }, reverse: true },
    { id: "q09", text: "頭の中では考えているのに、うまく言葉にできない。", axisWeights: { expression: 1 } },
    { id: "q10", text: "言いたいことはあるが、適切な表現が見つからず止まってしまう。", axisWeights: { expression: 1 } },
    { id: "q11", text: "伝えたい内容を順序立てて話せる。", axisWeights: { structure: 1 }, reverse: true },
    { id: "q12", text: "話している途中で、自分が何を言いたいのか分からなくなることがある。", axisWeights: { structure: 1 } },
    { id: "q13", text: "会話に入るタイミングがつかめず、発言を見送ることが多い。", axisWeights: { timing: 0.7, context: 0.3 } },
    { id: "q14", text: "話し始めるべき場面で、ためらってしまうことが多い。", axisWeights: { timing: 0.6, emotion: 0.4 } },
    { id: "q15", text: "緊張すると、声が出にくくなったり言葉が詰まったりする。", axisWeights: { emotion: 0.8, expression: 0.2 } },
    { id: "q16", text: "会話中にミスを恐れて、言いたいことがあっても控えてしまう。", axisWeights: { emotion: 0.7, timing: 0.3 } },
    { id: "q17", text: "人と話す機会が少なく、慣れていないと感じる。", axisWeights: { experience: 1 } },
    { id: "q18", text: "会話で『うまく話せた』と感じる経験があまりない。", axisWeights: { experience: 1 } },
    { id: "q19", text: "会話を重ねることで、少しずつ上達している実感がある。", axisWeights: { experience: 1 }, reverse: true },
    { id: "q20", text: "人と話すことに、ある程度慣れている。", axisWeights: { experience: 1 }, reverse: true },
    { id: "q21", text: "相手に合わせて、話し方や言葉選びを調整できる。", axisWeights: { context: 0.5, expression: 0.5 }, reverse: true },
    { id: "q22", text: "会話の途中で、相手が退屈していそうかどうかを察知できる。", axisWeights: { context: 1 }, reverse: true },
    { id: "q23", text: "沈黙が続くと、焦りが強くなる。", axisWeights: { emotion: 0.5, timing: 0.5 } },
    { id: "q24", text: "相手の話の意図をつかみ損ねて、返答に困ることがある。", axisWeights: { response: 0.6, context: 0.4 } },
    { id: "q25", text: "聞いた内容を踏まえて、自分の意見や感想を返すのが得意だ。", axisWeights: { response: 1 }, reverse: true },
    { id: "q26", text: "長く話そうとすると、話の筋道が崩れやすい。", axisWeights: { structure: 1 } },
    { id: "q27", text: "短くても、要点を押さえて伝えられる。", axisWeights: { structure: 0.5, expression: 0.5 }, reverse: true },
    { id: "q28", text: "思いついたことを、その場で言葉にするのが苦手だ。", axisWeights: { expression: 0.7, timing: 0.3 } },
    { id: "q29", text: "複数人の会話では、発言のタイミングがさらに難しく感じる。", axisWeights: { timing: 0.6, context: 0.4 } },
    { id: "q30", text: "多少うまくいかなくても、次の会話でまた試してみようと思える。", axisWeights: { experience: 0.7, emotion: 0.3 }, reverse: true },
    { id: "q31", text: "相手の話を聞きながら、返答を考えるのが難しい。", axisWeights: { response: 0.6, topic: 0.4 } },
    { id: "q32", text: "雑談では特に、何を言えばよいか分からなくなる。", axisWeights: { topic: 0.8, context: 0.2 } },
  ],
};

const state = {
  shuffledQuestions: [],
  answers: {},
  currentIndex: 0,
};

const screens = {
  intro: document.getElementById("screen-intro"),
  questionnaire: document.getElementById("screen-questionnaire"),
  result: document.getElementById("screen-result"),
};

const axisPreview = document.getElementById("axis-preview");
const startButton = document.getElementById("start-button");
const progressText = document.getElementById("progress-text");
const progressBarFill = document.getElementById("progress-bar-fill");
const questionAxisTags = document.getElementById("question-axis-tags");
const questionText = document.getElementById("question-text");
const likertOptions = document.getElementById("likert-options");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const backToTopButton = document.getElementById("back-to-top-button");
const retryButton = document.getElementById("retry-button");
const scoreList = document.getElementById("score-list");
const radarChart = document.getElementById("radar-chart");

function init() {
  renderAxisPreview();
  bindEvents();
}

function renderAxisPreview() {
  axisPreview.innerHTML = "";
  DIAGNOSIS_DATA.axes.forEach((axis) => {
    const li = document.createElement("li");
    li.textContent = `${axis.label}：${axis.description}`;
    axisPreview.appendChild(li);
  });
}

function bindEvents() {
  startButton.addEventListener("click", startDiagnosis);
  prevButton.addEventListener("click", handlePrev);
  nextButton.addEventListener("click", handleNext);
  retryButton.addEventListener("click", resetDiagnosis);
  backToTopButton.addEventListener("click", () => showScreen("intro"));
}

function startDiagnosis() {
  state.currentIndex = 0;
  state.answers = {};
  state.shuffledQuestions = shuffle([...DIAGNOSIS_DATA.questions]);
  showScreen("questionnaire");
  renderQuestion();
}

function resetDiagnosis() {
  showScreen("intro");
}

function showScreen(screenKey) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === screenKey);
  });
}

function handlePrev() {
  saveCurrentAnswer();
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
}

function handleNext() {
  const selectedValue = getSelectedLikertValue();
  if (selectedValue === null) {
    window.alert("回答を選択してください。");
    return;
  }

  saveCurrentAnswer();

  if (state.currentIndex === state.shuffledQuestions.length - 1) {
    showResults();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
}

function renderQuestion() {
  const question = state.shuffledQuestions[state.currentIndex];
  const currentAnswer = state.answers[question.id] ?? null;
  const progress = ((state.currentIndex + 1) / state.shuffledQuestions.length) * 100;

  progressText.textContent = `質問 ${state.currentIndex + 1} / ${state.shuffledQuestions.length}`;
  progressBarFill.style.width = `${progress}%`;

  questionText.textContent = question.text;
  questionAxisTags.textContent = axisNamesFromWeights(question.axisWeights).join(" / ");

  likertOptions.innerHTML = "";
  DIAGNOSIS_DATA.likertScale.forEach((option) => {
    const wrapper = document.createElement("div");
    wrapper.className = "likert-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question-${question.id}`;
    input.id = `question-${question.id}-value-${option.value}`;
    input.value = String(option.value);
    if (currentAnswer === option.value) {
      input.checked = true;
    }

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.innerHTML = `
      <span class="likert-value">${option.value}</span>
      <span class="likert-label">${option.label}</span>
    `;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    likertOptions.appendChild(wrapper);
  });

  prevButton.disabled = state.currentIndex === 0;
  nextButton.textContent = state.currentIndex === state.shuffledQuestions.length - 1 ? "提出する" : "次へ";
}

function getSelectedLikertValue() {
  const question = state.shuffledQuestions[state.currentIndex];
  const checked = document.querySelector(`input[name="question-${question.id}"]:checked`);
  return checked ? Number(checked.value) : null;
}

function saveCurrentAnswer() {
  const question = state.shuffledQuestions[state.currentIndex];
  const selectedValue = getSelectedLikertValue();
  if (selectedValue !== null) {
    state.answers[question.id] = selectedValue;
  }
}

function showResults() {
  const scores = calculateScores();
  renderScoreList(scores);
  drawRadarChart(scores);
  showScreen("result");
}

function calculateScores() {
  const totals = Object.fromEntries(DIAGNOSIS_DATA.axes.map((axis) => [axis.id, 0]));
  const weights = Object.fromEntries(DIAGNOSIS_DATA.axes.map((axis) => [axis.id, 0]));

  state.shuffledQuestions.forEach((question) => {
    const rawAnswer = state.answers[question.id];
    if (typeof rawAnswer !== "number") {
      return;
    }

    const adjustedAnswer = question.reverse ? 6 - rawAnswer : rawAnswer;

    Object.entries(question.axisWeights).forEach(([axisId, weight]) => {
      totals[axisId] += adjustedAnswer * weight;
      weights[axisId] += weight;
    });
  });

  return DIAGNOSIS_DATA.axes.map((axis) => {
    const average = weights[axis.id] > 0 ? totals[axis.id] / weights[axis.id] : 0;
    const normalized = average > 0 ? ((average - 1) / 4) * 100 : 0;
    return {
      id: axis.id,
      label: axis.label,
      description: axis.description,
      average,
      score: Math.round(normalized),
    };
  });
}

function renderScoreList(scores) {
  scoreList.innerHTML = "";
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  sortedScores.forEach((item) => {
    const container = document.createElement("div");
    container.className = "score-item";
    container.innerHTML = `
      <div class="score-item-header">
        <div>
          <div class="score-item-title">${item.label}</div>
          <div class="likert-label">${item.description}</div>
        </div>
        <div class="score-item-value">${item.score} / 100</div>
      </div>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${item.score}%;"></div>
      </div>
    `;
    scoreList.appendChild(container);
  });
}

function drawRadarChart(scores) {
  const canvas = radarChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const levels = 5;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(0.5, 0.5);

  ctx.strokeStyle = "#d9e0ea";
  ctx.fillStyle = "#1f2937";
  ctx.lineWidth = 1;
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  for (let level = 1; level <= levels; level += 1) {
    const levelRadius = (radius * level) / levels;
    ctx.beginPath();
    scores.forEach((_, index) => {
      const point = polarToCartesian(cx, cy, levelRadius, angleForIndex(index, scores.length));
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
  }

  scores.forEach((item, index) => {
    const angle = angleForIndex(index, scores.length);
    const axisEnd = polarToCartesian(cx, cy, radius, angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(axisEnd.x, axisEnd.y);
    ctx.stroke();

    const labelPoint = polarToCartesian(cx, cy, radius + 32, angle);
    ctx.textAlign = labelPoint.x < cx - 8 ? "right" : labelPoint.x > cx + 8 ? "left" : "center";
    ctx.textBaseline = labelPoint.y < cy - 8 ? "bottom" : labelPoint.y > cy + 8 ? "top" : "middle";
    wrapText(ctx, item.label, labelPoint.x, labelPoint.y, 90, 16);
  });

  ctx.beginPath();
  scores.forEach((item, index) => {
    const pointRadius = (item.score / 100) * radius;
    const point = polarToCartesian(cx, cy, pointRadius, angleForIndex(index, scores.length));
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(37, 99, 235, 0.24)";
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  scores.forEach((item, index) => {
    const pointRadius = (item.score / 100) * radius;
    const point = polarToCartesian(cx, cy, pointRadius, angleForIndex(index, scores.length));
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fill();
  });

  ctx.restore();
}

function axisNamesFromWeights(axisWeights) {
  return Object.keys(axisWeights).map((axisId) => {
    const axis = DIAGNOSIS_DATA.axes.find((item) => item.id === axisId);
    return axis ? axis.label : axisId;
  });
}

function angleForIndex(index, total) {
  return (-Math.PI / 2) + (Math.PI * 2 * index) / total;
}

function polarToCartesian(cx, cy, radius, angle) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split("");
  let line = "";
  const lines = [];

  words.forEach((char) => {
    const testLine = line + char;
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  });
  if (line) {
    lines.push(line);
  }

  const totalHeight = lineHeight * (lines.length - 1);
  lines.forEach((entry, index) => {
    ctx.fillStyle = "#1f2937";
    ctx.fillText(entry, x, y + index * lineHeight - totalHeight / 2);
  });
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

init();
