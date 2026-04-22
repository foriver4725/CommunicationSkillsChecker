// 本番用:
const DATA_URL = "./diagnosis-data.json";

// テスト用:
// const DATA_URL = "./diagnosis-data-dummy.json";

// テスト用(質問1件だけ):
// const DATA_URL = "./diagnosis-data-dummy-single.json";

/**
 * アプリ全体の状態
 * - data: 読み込んだ診断データ
 * - shuffledQuestions: 表示順に並び替えた質問一覧
 * - answers: 質問ID -> 回答値
 * - currentPageIndex: 現在表示中のページ番号
 * - visitedPages: 一度でも訪れたページ
 * - leftPages: 一度離脱したページ
 */
const state = createInitialState();

/** 画面DOM */
const screens = {
  intro: document.getElementById("screen-intro"),
  questionnaire: document.getElementById("screen-questionnaire"),
  result: document.getElementById("screen-result"),
};

/** 共通DOM */
const appTitle = document.getElementById("app-title");
const appDescription = document.getElementById("app-description");
const introSteps = document.getElementById("intro-steps");
const axisPreview = document.getElementById("axis-preview");

const startButton = document.getElementById("start-button");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const backToTopButton = document.getElementById("back-to-top-button");
const retryButton = document.getElementById("retry-button");
const shareXButton = document.getElementById("share-x-button");

const progressText = document.getElementById("progress-text");
const progressPages = document.getElementById("progress-pages");
const questionList = document.getElementById("question-list");

const topAxesText = document.getElementById("top-axes-text");
const scoreList = document.getElementById("score-list");
const radarChart = document.getElementById("radar-chart");

/**
 * アプリ初期化
 * - JSON読込
 * - データ検証
 * - イントロ描画
 * - イベント登録
 */
async function init() {
  try {
    const data = await loadDiagnosisData();
    validateDiagnosisData(data);

    state.data = data;

    renderIntro();
    bindEvents();
  } catch (error) {
    console.error(error);
    appDescription.textContent =
      "データの読み込みに失敗しました。diagnosis-data.json の形式を確認してください。";
    startButton.disabled = true;
  }
}

/**
 * 初期状態を生成する
 */
function createInitialState() {
  return {
    data: null,
    shuffledQuestions: [],
    answers: {},
    currentPageIndex: 0,
    visitedPages: new Set(),
    leftPages: new Set(),
  };
}

/**
 * 診断進行中の状態だけ初期化する
 * data は保持し、質問順・回答・進捗状態だけ戻す
 */
function resetSessionState() {
  state.shuffledQuestions = [];
  state.answers = {};
  state.currentPageIndex = 0;
  state.visitedPages = new Set();
  state.leftPages = new Set();
}

/**
 * 診断データを読み込む
 */
async function loadDiagnosisData() {
  const response = await fetch(DATA_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`データの読み込みに失敗しました: ${response.status}`);
  }

  return response.json();
}

/**
 * 診断データの最低限の構造を検証する
 */
function validateDiagnosisData(data) {
  if (
    !data ||
    !Array.isArray(data.axes) ||
    !Array.isArray(data.questions) ||
    !Array.isArray(data.likertScale)
  ) {
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

/**
 * イントロ画面を描画する
 */
function renderIntro() {
  const { data } = state;

  document.title = data.title ?? "コミュニケーション診断";
  appTitle.textContent = data.title ?? "コミュニケーション診断";
  appDescription.innerHTML = (
    data.description ??
    "質問に答えることで、コミュニケーションの苦手ポイントを可視化します。"
  ).replaceAll("\n", "<br />");

  renderIntroSteps();
  renderIntroDescription();
}

/**
 * イントロの進め方を描画する
 */
function renderIntroSteps() {
  const { data } = state;

  introSteps.innerHTML = "";

  const steps = [
    `全${data.questions.length}問に回答します`,
    `${getPageSize()}問ずつ表示されます`,
    "最後に結果を見ると診断結果が表示されます",
  ];

  steps.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    introSteps.appendChild(li);
  });
}

/**
 * イントロの説明文を描画する
 */
function renderIntroDescription() {
  axisPreview.innerHTML = `
    質問への回答から、会話の中でつまずきやすい傾向を整理して表示します。<br />
    正解・不正解はなく、現在の傾向を知るための診断です。
  `;
}

/**
 * 各種イベントを登録する
 */
function bindEvents() {
  startButton.addEventListener("click", startDiagnosis);
  prevButton.addEventListener("click", handlePrevPage);
  nextButton.addEventListener("click", handleNextPage);
  backToTopButton.addEventListener("click", handleBackToTop);
  retryButton.addEventListener("click", handleRetryDiagnosis);
  shareXButton.addEventListener("click", handleShareX);
}

/**
 * 診断を開始する
 */
function startDiagnosis() {
  resetSessionState();

  state.shuffledQuestions = shuffle([...state.data.questions]);
  state.visitedPages = new Set([0]);

  showScreen("questionnaire");
  renderQuestionPage();
}

/**
 * 「診断をやめる」
 * 回答を破棄してタイトルへ戻る
 */
function handleBackToTop() {
  if (
    !window.confirm(
      "ここまでの回答はリセットされます。\n診断をやめてタイトルへ戻りますか？"
    )
  ) {
    return;
  }

  resetSessionState();
  showScreen("intro");
}

/**
 * 「もう一度診断する」
 * 結果を破棄してタイトルへ戻る
 */
function handleRetryDiagnosis() {
  if (
    !window.confirm(
      "現在の診断結果はリセットされます。\nもう一度診断しますか？"
    )
  ) {
    return;
  }

  resetSessionState();
  showScreen("intro");
}

/**
 * 「Xで共有」ボタンのクリックを処理する
 * Web Share API を優先的に使い、利用できない場合は X 共有用のインテントURLを開く
 */
function handleShareX() {
  const scores = calculateScores();

  if (!scores.length) {
    return;
  }

  const topAxis = getTopScoreItem(scores);

  const text =
    `コミュニケーションの苦手ポイント診断をやってみた！\n` +
    `私の強みは「${topAxis.label}」でした。\n` +
    `あなたも試してみてね。\n` +
    `#コミュニケーション診断`;

  const pageUrl = window.location.href;
  const shareData = {
    title: "コミュニケーションの苦手ポイント診断",
    text,
    url: pageUrl,
  };

  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (
    isMobile &&
    typeof navigator.share === "function" &&
    (!navigator.canShare || navigator.canShare(shareData))
  ) {
    navigator.share(shareData).catch((error) => {
      // キャンセル時は何もしない
      if (error && error.name === "AbortError") {
        return;
      }

      openXIntent(text, pageUrl);
    });
    return;
  }

  openXIntent(text, pageUrl);
}

/**
 * X 共有用のインテントURLを開く
 */
function openXIntent(text, pageUrl) {
  const url =
    "https://x.com/intent/post?text=" +
    encodeURIComponent(text) +
    "&url=" +
    encodeURIComponent(pageUrl);

  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * 画面を切り替える
 */
function showScreen(screenKey) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === screenKey);
  });

  scrollPageToTop();
}

/**
 * 1ページあたりの表示件数
 */
function getPageSize() {
  return Number(state.data.pageSize) > 0 ? Number(state.data.pageSize) : 5;
}

/**
 * 総ページ数
 */
function getTotalPages() {
  return Math.ceil(state.shuffledQuestions.length / getPageSize());
}

/**
 * 指定ページの質問一覧を返す
 */
function getPageQuestions(pageIndex) {
  const pageSize = getPageSize();
  const start = pageIndex * pageSize;
  return state.shuffledQuestions.slice(start, start + pageSize);
}

/**
 * 現在ページの質問一覧を返す
 */
function getQuestionsForCurrentPage() {
  return getPageQuestions(state.currentPageIndex);
}

/**
 * 指定ページの進捗状態を返す
 * - unanswered: 未訪問、または訪問中でまだ離脱していない未完了ページ
 * - incomplete: 一度離脱済みで未回答あり
 * - complete: 全回答済み
 */
function getPageStatus(pageIndex) {
  const pageQuestions = getPageQuestions(pageIndex);

  if (pageQuestions.length === 0) {
    return "unanswered";
  }

  if (!state.visitedPages.has(pageIndex)) {
    return "unanswered";
  }

  const answeredCount = pageQuestions.filter((question) => {
    return isAnswered(question.id);
  }).length;

  if (answeredCount === pageQuestions.length) {
    return "complete";
  }

  if (!state.leftPages.has(pageIndex)) {
    return "unanswered";
  }

  return "incomplete";
}

/**
 * 進捗ブロックを描画する
 */
function renderProgressPages() {
  progressPages.innerHTML = "";

  for (let pageIndex = 0; pageIndex < getTotalPages(); pageIndex += 1) {
    const block = document.createElement("div");
    const status = getPageStatus(pageIndex);

    block.className = "progress-page-block";
    block.classList.add(`is-${status}`);

    if (pageIndex === state.currentPageIndex) {
      block.classList.add("is-current");
    }

    block.title = `ページ ${pageIndex + 1}`;
    progressPages.appendChild(block);
  }
}

/**
 * 前ページへ移動する
 * 現在ページの回答を保存してから戻る
 */
function handlePrevPage() {
  saveCurrentPageAnswers();

  if (state.currentPageIndex <= 0) {
    return;
  }

  markCurrentPageAsLeft();

  state.currentPageIndex -= 1;
  state.visitedPages.add(state.currentPageIndex);

  renderQuestionPage();
  scrollPageToTop();
}

/**
 * 次ページへ進む / 最終ページなら結果を見る
 * ページ途中では未回答警告を出さず、最後だけ全体チェックする
 */
function handleNextPage() {
  saveCurrentPageAnswers();

  if (isLastPage()) {
    if (hasUnansweredQuestions()) {
      window.alert("未回答の質問があります。赤いページを確認してください。");
      renderQuestionPage();
      return;
    }

    if (
      !window.confirm(
        "回答を確定して診断結果を表示します。\nこのまま結果を見ますか？"
      )
    ) {
      return;
    }

    showResults();
    return;
  }

  markCurrentPageAsLeft();

  state.currentPageIndex += 1;
  state.visitedPages.add(state.currentPageIndex);

  renderQuestionPage();
  scrollPageToTop();
}

/**
 * 現在ページを離脱済みとして記録する
 */
function markCurrentPageAsLeft() {
  state.leftPages.add(state.currentPageIndex);
}

/**
 * 最終ページかどうか
 */
function isLastPage() {
  return state.currentPageIndex === getTotalPages() - 1;
}

/**
 * 未回答が1件でもあるか
 */
function hasUnansweredQuestions() {
  return state.shuffledQuestions.some((question) => !isAnswered(question.id));
}

/**
 * 指定質問が回答済みかどうか
 */
function isAnswered(questionId) {
  return typeof state.answers[questionId] === "number";
}

/**
 * ページを先頭までスクロールする
 */
function scrollPageToTop() {
  window.scrollTo(0, 0);
}

/**
 * 質問ページを再描画する
 */
function renderQuestionPage() {
  const questions = getQuestionsForCurrentPage();
  const totalQuestions = state.shuffledQuestions.length;
  const pageStartQuestionNumber = state.currentPageIndex * getPageSize() + 1;

  progressText.textContent = `${Object.keys(state.answers).length} / ${totalQuestions} 問回答`;
  renderProgressPages();

  questionList.innerHTML = "";

  questions.forEach((question, index) => {
    const questionNumber = pageStartQuestionNumber + index;
    questionList.appendChild(createQuestionCard(question, questionNumber));
  });

  prevButton.disabled = state.currentPageIndex === 0;
  nextButton.textContent = isLastPage() ? "結果を見る" : "次へ";
}

/**
 * 質問カードを生成する
 */
function createQuestionCard(question, questionNumber) {
  const currentAnswer = state.answers[question.id] ?? null;
  const wrapper = document.createElement("article");

  wrapper.className = "question-item";
  wrapper.innerHTML = `
    <div class="question-item-inner">
      <div class="question-visual">
        ${buildQuestionVisualHtml(question.imageUrl)}
      </div>
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
  appendLikertOptions(optionsContainer, question.id, currentAnswer);

  return wrapper;
}

/**
 * 質問画像部分のHTMLを生成する
 */
function buildQuestionVisualHtml(imageUrl) {
  if (imageUrl) {
    return `<img class="question-image" src="${escapeHtml(
      imageUrl
    )}" alt="質問のイメージ画像" loading="lazy" />`;
  }

  return `<div class="question-image-placeholder">画像URLを設定すると、ここに表示されます。</div>`;
}

/**
 * 4択の選択肢をDOMに追加する
 */
function appendLikertOptions(container, questionId, currentAnswer) {
  state.data.likertScale.forEach((option) => {
    const optionWrapper = document.createElement("div");
    optionWrapper.className = "likert-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question-${questionId}`;
    input.id = `question-${questionId}-value-${option.value}`;
    input.value = String(option.value);
    input.checked = currentAnswer === option.value;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.innerHTML = `
      <span class="likert-value">${escapeHtml(String(option.value))}</span>
      <span class="likert-label">${escapeHtml(option.label)}</span>
    `;

    optionWrapper.appendChild(input);
    optionWrapper.appendChild(label);
    container.appendChild(optionWrapper);
  });
}

/**
 * 指定質問の現在選択中の値を取得する
 */
function getSelectedLikertValue(questionId) {
  const checked = document.querySelector(
    `input[name="question-${questionId}"]:checked`
  );
  return checked ? Number(checked.value) : null;
}

/**
 * 現在ページの回答を state.answers に保存する
 */
function saveCurrentPageAnswers() {
  getQuestionsForCurrentPage().forEach((question) => {
    const selectedValue = getSelectedLikertValue(question.id);

    if (selectedValue !== null) {
      state.answers[question.id] = selectedValue;
    }
  });
}

/**
 * 結果画面を表示する
 */
function showResults() {
  const scores = calculateScores();

  renderScoreList(scores);
  topAxesText.innerHTML = buildTopAxesHtml(scores);

  showScreen("result");

  requestAnimationFrame(() => {
    drawRadarChart(scores);
  });
}

/**
 * 最上位スコアの軸を取得する
 * 同率の場合は、配列の先頭側を優先する
 */
function getTopScoreItem(scores) {
  let topItem = scores[0];

  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i].score > topItem.score) {
      topItem = scores[i];
    }
  }

  return topItem;
}

/**
 * 「あなたの強み」表示用HTMLを組み立てる
 */
function buildTopAxesHtml(scores) {
  if (!scores.length) {
    return "";
  }

  const topItem = getTopScoreItem(scores);

  return `
    <span class="top-axes-label">あなたの強み</span>
    <span class="top-axes-value">${escapeHtml(topItem.label)}</span>
  `;
}

/**
 * 各軸のスコアを計算する
 * reverse=true の質問は尺度を反転して扱う
 */
function calculateScores() {
  const totals = Object.fromEntries(
    state.data.axes.map((axis) => [axis.id, 0])
  );
  const weights = Object.fromEntries(
    state.data.axes.map((axis) => [axis.id, 0])
  );

  const scaleValues = state.data.likertScale.map((item) => Number(item.value));
  const maxScaleValue = Math.max(...scaleValues);
  const minScaleValue = Math.min(...scaleValues);
  const scaleRange = maxScaleValue - minScaleValue;

  state.shuffledQuestions.forEach((question) => {
    const rawAnswer = state.answers[question.id];

    if (typeof rawAnswer !== "number") {
      return;
    }

    const adjustedAnswer = question.reverse
      ? maxScaleValue + minScaleValue - rawAnswer
      : rawAnswer;

    Object.entries(question.axisWeights).forEach(([axisId, weight]) => {
      totals[axisId] += adjustedAnswer * weight;
      weights[axisId] += weight;
    });
  });

  return state.data.axes.map((axis) => {
    const average =
      weights[axis.id] > 0 ? totals[axis.id] / weights[axis.id] : 0;

    const normalized =
      average > 0 && scaleRange > 0
        ? ((average - minScaleValue) / scaleRange) * 100
        : 0;

    return {
      id: axis.id,
      label: axis.label,
      description: axis.description,
      average,
      score: Math.round(normalized),
    };
  });
}

/**
 * 右カラムのスコア一覧を描画する
 */
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

/**
 * レーダーチャートを描画する
 */
function drawRadarChart(scores) {
  const canvas = radarChart;
  const ctx = canvas.getContext("2d");
  const parentWidth = canvas.parentElement.clientWidth;

  const displaySize = Math.max(220, Math.min(parentWidth - 28, 420));

  canvas.width = displaySize;
  canvas.height = displaySize;

  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.28;
  const levels = 5;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(0.5, 0.5);

  ctx.strokeStyle = "#d9e0ea";
  ctx.fillStyle = "#1f2937";
  ctx.lineWidth = 1;
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  drawRadarGrid(ctx, scores, cx, cy, radius, levels);
  drawRadarAxes(ctx, scores, cx, cy, radius);
  drawRadarPolygon(ctx, scores, cx, cy, radius);

  ctx.restore();
}

/**
 * レーダーチャートの同心多角形を描画する
 */
function drawRadarGrid(ctx, scores, cx, cy, radius, levels) {
  for (let level = 1; level <= levels; level += 1) {
    const levelRadius = (radius * level) / levels;

    ctx.beginPath();

    scores.forEach((_, index) => {
      const point = polarToCartesian(
        cx,
        cy,
        levelRadius,
        angleForIndex(index, scores.length)
      );

      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.closePath();
    ctx.stroke();
  }
}

/**
 * レーダーチャートの軸線とラベルを描画する
 */
function drawRadarAxes(ctx, scores, cx, cy, radius) {
  scores.forEach((item, index) => {
    const angle = angleForIndex(index, scores.length);
    const axisEnd = polarToCartesian(cx, cy, radius, angle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(axisEnd.x, axisEnd.y);
    ctx.stroke();

    const labelPoint = polarToCartesian(cx, cy, radius + 32, angle);
    ctx.textAlign =
      labelPoint.x < cx - 8 ? "right" :
        labelPoint.x > cx + 8 ? "left" :
          "center";
    ctx.textBaseline =
      labelPoint.y < cy - 8 ? "bottom" :
        labelPoint.y > cy + 8 ? "top" :
          "middle";

    wrapText(ctx, item.label, labelPoint.x, labelPoint.y, 90, 16);
  });
}

/**
 * レーダーチャートのスコア多角形を描画する
 */
function drawRadarPolygon(ctx, scores, cx, cy, radius) {
  ctx.beginPath();

  scores.forEach((item, index) => {
    const pointRadius = (item.score / 100) * radius;
    const point = polarToCartesian(
      cx,
      cy,
      pointRadius,
      angleForIndex(index, scores.length)
    );

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
    const point = polarToCartesian(
      cx,
      cy,
      pointRadius,
      angleForIndex(index, scores.length)
    );

    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fill();
  });
}

/**
 * 指定インデックスに対応する角度を返す
 */
function angleForIndex(index, total) {
  return -Math.PI / 2 + (Math.PI * 2 * index) / total;
}

/**
 * 極座標を直交座標へ変換する
 */
function polarToCartesian(cx, cy, radius, angle) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

/**
 * レーダーチャートのラベルを折り返して描画する
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("");
  let line = "";
  const lines = [];

  chars.forEach((char) => {
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

/**
 * Fisher-Yates シャッフル
 */
function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();
