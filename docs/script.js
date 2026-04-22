const DATA_URL = "./diagnosis-data.json";
// const DATA_URL = "./diagnosis-data-dummy.json";

const state = {
  data: null,
  shuffledQuestions: [],
  answers: {},
  currentPageIndex: 0,
};

const screens = {
  intro: document.getElementById("screen-intro"),
  questionnaire: document.getElementById("screen-questionnaire"),
  result: document.getElementById("screen-result"),
};

const appTitle = document.getElementById("app-title");
const appDescription = document.getElementById("app-description");
const introSteps = document.getElementById("intro-steps");
const axisPreview = document.getElementById("axis-preview");
const startButton = document.getElementById("start-button");
const progressText = document.getElementById("progress-text");
const topAxesText = document.getElementById("top-axes-text");
const progressBarFill = document.getElementById("progress-bar-fill");
const questionList = document.getElementById("question-list");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const backToTopButton = document.getElementById("back-to-top-button");
const retryButton = document.getElementById("retry-button");
const shareXButton = document.getElementById("share-x-button");
const scoreList = document.getElementById("score-list");
const radarChart = document.getElementById("radar-chart");

async function init() {
  try {
    const data = await loadDiagnosisData();
    validateDiagnosisData(data);
    state.data = data;
    renderIntro();
    bindEvents();
  } catch (error) {
    console.error(error);
    appDescription.textContent = "データの読み込みに失敗しました。diagnosis-data.json の形式を確認してください。";
    startButton.disabled = true;
  }
}

async function loadDiagnosisData() {
  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`データの読み込みに失敗しました: ${response.status}`);
  }
  return response.json();
}

function validateDiagnosisData(data) {
  if (!data || !Array.isArray(data.axes) || !Array.isArray(data.questions) || !Array.isArray(data.likertScale)) {
    throw new Error("diagnosis-data.json の基本構造が不正です。");
  }

  if (data.likertScale.length !== 4) {
    throw new Error("likertScale は 4 項目で定義してください。");
  }

  const axisIds = new Set(data.axes.map((axis) => axis.id));
  data.questions.forEach((question) => {
    if (!question.id || !question.text || !question.axisWeights) {
      throw new Error(`質問データが不正です: ${JSON.stringify(question)}`);
    }
    Object.keys(question.axisWeights).forEach((axisId) => {
      if (!axisIds.has(axisId)) {
        throw new Error(`未定義の軸が使われています: ${axisId}`);
      }
    });
  });
}

function renderIntro() {
  const { data } = state;
  document.title = data.title ?? "コミュニケーション診断";
  appTitle.textContent = data.title ?? "コミュニケーション診断";
  appDescription.innerHTML = (data.description ?? "質問に答えることで、コミュニケーションの苦手ポイントを可視化します。").replaceAll("\n", "<br />");

  introSteps.innerHTML = "";
  const steps = [
    `全${state.data.questions.length}問に回答します`,
    `${data.pageSize ?? 5}問ずつ表示されます`,
    "最後に提出すると結果が表示されます",
  ];
  steps.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    introSteps.appendChild(li);
  });

  axisPreview.innerHTML = `
  質問への回答から、会話の中でつまずきやすい傾向を整理して表示します。<br />
  正解・不正解はなく、現在の傾向を知るための診断です。
`;
}

function bindEvents() {
  startButton.addEventListener("click", startDiagnosis);
  prevButton.addEventListener("click", handlePrevPage);
  nextButton.addEventListener("click", handleNextPage);
  retryButton.addEventListener("click", handleRetryDiagnosis);
  backToTopButton.addEventListener("click", handleBackToTop);
  shareXButton.addEventListener("click", handleShareX);
}

function startDiagnosis() {
  state.currentPageIndex = 0;
  state.answers = {};
  state.shuffledQuestions = shuffle([...state.data.questions]);
  showScreen("questionnaire");
  renderQuestionPage();
}

function resetDiagnosis() {
  showScreen("intro");
}

function handleBackToTop() {
  const ok = window.confirm(
    "ここまでの回答はリセットされます。\n最初に戻りますか？"
  );

  if (!ok) {
    return;
  }

  state.answers = {};
  state.currentPageIndex = 0;
  state.shuffledQuestions = [];
  showScreen("intro");
}

function handleRetryDiagnosis() {
  const ok = window.confirm(
    "現在の診断結果はリセットされます。\nもう一度診断しますか？"
  );

  if (!ok) {
    return;
  }

  state.answers = {};
  state.currentPageIndex = 0;
  state.shuffledQuestions = [];
  showScreen("intro");
}

function handleShareX() {
  const scores = calculateScores();

  if (!scores.length) {
    return;
  }

  let topItem = scores[0];

  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i].score > topItem.score) {
      topItem = scores[i];
    }
  }

  const text =
    `コミュニケーションの苦手ポイント診断をやってみた！\n` +
    `私の強みは「${topItem.label}」でした。\n` +
    `あなたも試してみてね。\n` +
    `#コミュニケーション診断`;

  const pageUrl = window.location.href;
  const url =
    "https://x.com/intent/post?text=" + encodeURIComponent(text) +
    "&url=" + encodeURIComponent(pageUrl);
  window.open(url, "_blank", "noopener,noreferrer");
}

function showScreen(screenKey) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === screenKey);
  });
}

function getPageSize() {
  return Number(state.data.pageSize) > 0 ? Number(state.data.pageSize) : 5;
}

function getTotalPages() {
  return Math.ceil(state.shuffledQuestions.length / getPageSize());
}

function getQuestionsForCurrentPage() {
  const pageSize = getPageSize();
  const start = state.currentPageIndex * pageSize;
  return state.shuffledQuestions.slice(start, start + pageSize);
}

function handlePrevPage() {
  saveCurrentPageAnswers();
  if (state.currentPageIndex > 0) {
    state.currentPageIndex -= 1;
    renderQuestionPage();
    scrollQuestionnaireToTop();
  }
}

function handleNextPage() {
  const currentPageQuestions = getQuestionsForCurrentPage();
  const unansweredQuestion = currentPageQuestions.find((question) => getSelectedLikertValue(question.id) === null);

  if (unansweredQuestion) {
    window.alert("このページの質問にすべて回答してください。");
    return;
  }

  saveCurrentPageAnswers();

  if (state.currentPageIndex === getTotalPages() - 1) {
    showResults();
    return;
  }

  state.currentPageIndex += 1;
  renderQuestionPage();
  scrollQuestionnaireToTop();
}

function scrollQuestionnaireToTop() {
  const header = document.querySelector(".questionnaire-header");
  const headerBottom = header
    ? header.getBoundingClientRect().bottom + window.scrollY
    : 0;

  window.scrollTo({
    top: Math.max(headerBottom - 8, 0),
    behavior: "smooth",
  });
}

function getTopAxesSummary(scores = calculateScores()) {
  if (!scores.length) {
    return "";
  }

  let topItem = scores[0];

  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i].score > topItem.score) {
      topItem = scores[i];
    }
  }

  return `
    <span class="top-axes-label">あなたの強み</span>
    <span class="top-axes-value">${escapeHtml(topItem.label)}</span>
  `;
}

function renderQuestionPage() {
  const questions = getQuestionsForCurrentPage();
  const totalQuestions = state.shuffledQuestions.length;
  const pageStartQuestionNumber = state.currentPageIndex * getPageSize() + 1;
  const pageEndQuestionNumber = pageStartQuestionNumber + questions.length - 1;

  const progressCount = Object.keys(state.answers).length;
  const progress = (progressCount / totalQuestions) * 100;

  progressText.textContent = `${progressCount} / ${totalQuestions} 問回答`;
  progressBarFill.style.width = `${progress}%`;

  questionList.innerHTML = "";
  questions.forEach((question, index) => {
    const questionNumber = pageStartQuestionNumber + index;
    questionList.appendChild(createQuestionCard(question, questionNumber));
  });

  const isLastPage = state.currentPageIndex === getTotalPages() - 1;
  nextButton.textContent = isLastPage ? "提出する" : "次へ";
  prevButton.disabled = state.currentPageIndex === 0;
}

function createQuestionCard(question, questionNumber) {
  const currentAnswer = state.answers[question.id] ?? null;
  const wrapper = document.createElement("article");
  wrapper.className = "question-item";

  const visualHtml = question.imageUrl
    ? `<img class="question-image" src="${escapeHtml(question.imageUrl)}" alt="質問のイメージ画像" loading="lazy" />`
    : `<div class="question-image-placeholder">画像URLを設定すると、ここに表示されます。</div>`;

  wrapper.innerHTML = `
    <div class="question-item-inner">
      <div class="question-visual">${visualHtml}</div>
      <div class="question-body">
        <p class="question-number">質問 ${questionNumber}</p>
        <h2 class="question-text">${escapeHtml(question.text)}</h2>
        <p class="question-help">もっとも近いものを選んでください。</p>
        <fieldset class="likert-fieldset">
          <legend class="sr-only">回答を選択</legend>
          <div class="likert-options"></div>
        </fieldset>
      </div>
    </div>
  `;

  const optionsContainer = wrapper.querySelector(".likert-options");
  state.data.likertScale.forEach((option) => {
    const optionWrapper = document.createElement("div");
    optionWrapper.className = "likert-option";

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
      <span class="likert-value">${escapeHtml(String(option.value))}</span>
      <span class="likert-label">${escapeHtml(option.label)}</span>
    `;

    optionWrapper.appendChild(input);
    optionWrapper.appendChild(label);
    optionsContainer.appendChild(optionWrapper);
  });

  return wrapper;
}

function getSelectedLikertValue(questionId) {
  const checked = document.querySelector(`input[name="question-${questionId}"]:checked`);
  return checked ? Number(checked.value) : null;
}

function saveCurrentPageAnswers() {
  getQuestionsForCurrentPage().forEach((question) => {
    const selectedValue = getSelectedLikertValue(question.id);
    if (selectedValue !== null) {
      state.answers[question.id] = selectedValue;
    }
  });
}

function showResults() {
  const scores = calculateScores();
  renderScoreList(scores);
  drawRadarChart(scores);
  topAxesText.innerHTML = getTopAxesSummary(scores);
  showScreen("result");
}

function calculateScores() {
  const totals = Object.fromEntries(state.data.axes.map((axis) => [axis.id, 0]));
  const weights = Object.fromEntries(state.data.axes.map((axis) => [axis.id, 0]));
  const maxScaleValue = Math.max(...state.data.likertScale.map((item) => Number(item.value)));
  const minScaleValue = Math.min(...state.data.likertScale.map((item) => Number(item.value)));
  const scaleRange = maxScaleValue - minScaleValue;

  state.shuffledQuestions.forEach((question) => {
    const rawAnswer = state.answers[question.id];
    if (typeof rawAnswer !== "number") {
      return;
    }

    const adjustedAnswer = question.reverse ? maxScaleValue + minScaleValue - rawAnswer : rawAnswer;

    Object.entries(question.axisWeights).forEach(([axisId, weight]) => {
      totals[axisId] += adjustedAnswer * weight;
      weights[axisId] += weight;
    });
  });

  return state.data.axes.map((axis) => {
    const average = weights[axis.id] > 0 ? totals[axis.id] / weights[axis.id] : 0;
    const normalized = average > 0 && scaleRange > 0 ? ((average - minScaleValue) / scaleRange) * 100 : 0;
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
          <div class="score-item-title">${escapeHtml(item.label)}</div>
          <div class="likert-label">${escapeHtml(item.description ?? "")}</div>
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
    const axis = state.data.axes.find((item) => item.id === axisId);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();
