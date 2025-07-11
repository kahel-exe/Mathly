let frac1, frac2, operation;
let answerDecimal;
let userDenominator = 4;
let selected = [];
let hoveredIndex = null;
let mode = "pie"; // or "grid"
let score = 0;
let answered = false;

const canvas = document.getElementById("pie");
const ctx = canvas.getContext("2d");

canvas.addEventListener("click", handleClick);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseleave", () => {
  hoveredIndex = null;
  drawBoard();
});

function getRandomFraction() {
  let denom = Math.floor(Math.random() * 5) + 2;
  let numer = Math.floor(Math.random() * (denom - 1)) + 1;
  return [numer, denom];
}

function generateProblem() {
  if (!answered) {
    score = 0;
    document.getElementById("score").textContent = `Score: ${score}`;
  }

  answered = false;

  let val1, val2;

  // Randomly choose mode
  mode = Math.random() < 0.5 ? "pie" : "grid";

  while (true) {
    frac1 = getRandomFraction();
    frac2 = getRandomFraction();
    operation = Math.random() < 0.5 ? "+" : "×";

    val1 = frac1[0] / frac1[1];
    val2 = frac2[0] / frac2[1];

    if (operation === "+" && val1 + val2 <= 1) {
      answerDecimal = val1 + val2;
      break;
    }
    if (operation === "×") {
      answerDecimal = val1 * val2;
      break;
    }
  }

  document.getElementById("userDenominator").value = 4;
  userDenominator = 4;
  selected = Array(userDenominator).fill(false);

  document.getElementById("question").textContent =
    `(${mode.toUpperCase()}) Shade the result of ${frac1[0]}/${frac1[1]} ${operation} ${frac2[0]}/${frac2[1]}`;
  document.getElementById("feedback").textContent = "";

  drawBoard();
}

function updateSlices() {
  userDenominator = parseInt(document.getElementById("userDenominator").value);
  if (isNaN(userDenominator) || userDenominator < 1) userDenominator = 1;
  selected = Array(userDenominator).fill(false);
  drawBoard();
}

function drawBoard(opacityOverride = null, targetIndex = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mode === "pie") {
    drawPie(opacityOverride, targetIndex);
  } else {
    drawGrid(opacityOverride, targetIndex);
  }
}

function drawPie(opacityOverride = null, targetIndex = null) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 150;
  const angle = (2 * Math.PI) / userDenominator;

  for (let i = 0; i < userDenominator; i++) {
    const start = i * angle;
    const end = start + angle;

    if (i === hoveredIndex && !selected[i]) {
      ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fill();
    }

    if (selected[i]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();

      if (i === targetIndex && opacityOverride !== null) {
        ctx.fillStyle = `rgba(36, 156, 164, ${opacityOverride})`;
      } else {
        ctx.fillStyle = "#249ca4";
      }

      ctx.fill();
    }

    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawGrid(opacityOverride = null, targetIndex = null) {
  const cols = Math.ceil(Math.sqrt(userDenominator));
  const rows = Math.ceil(userDenominator / cols);
  const boxSize = 50;
  const offsetX = (canvas.width - cols * boxSize) / 2;
  const offsetY = (canvas.height - rows * boxSize) / 2;

  for (let i = 0; i < userDenominator; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = offsetX + col * boxSize;
    const y = offsetY + row * boxSize;

    if (i === hoveredIndex && !selected[i]) {
      ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
      ctx.fillRect(x, y, boxSize, boxSize);
    }

    if (selected[i]) {
      ctx.fillStyle =
        i === targetIndex && opacityOverride !== null
          ? `rgba(36, 156, 164, ${opacityOverride})`
          : "#249ca4";
      ctx.fillRect(x, y, boxSize, boxSize);
    }

    ctx.strokeStyle = "#000";
    ctx.strokeRect(x, y, boxSize, boxSize);
  }
}

function handleClick(event) {
  const index = getIndexFromEvent(event);
  if (index === null) return;
  selected[index] = !selected[index];
  animateFill(index, selected[index]);
}

function animateFill(index, fill) {
  const steps = 10;
  let step = 0;
  const maxOpacity = fill ? 1 : 0;
  const startOpacity = fill ? 0 : 1;

  const animate = () => {
    const opacity = startOpacity + (maxOpacity - startOpacity) * (step / steps);
    drawBoard(opacity, index);
    step++;
    if (step <= steps) {
      requestAnimationFrame(animate);
    }
  };
  animate();
}

function handleMouseMove(event) {
  hoveredIndex = getIndexFromEvent(event);
  drawBoard();
}

function getIndexFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (mode === "pie") {
    const dx = x - canvas.width / 2;
    const dy = y - canvas.height / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 150) return null;
    const angle = Math.atan2(dy, dx);
    const fixedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    return Math.floor(fixedAngle / ((2 * Math.PI) / userDenominator));
  } else {
    const cols = Math.ceil(Math.sqrt(userDenominator));
    const rows = Math.ceil(userDenominator / cols);
    const boxSize = 50;
    const offsetX = (canvas.width - cols * boxSize) / 2;
    const offsetY = (canvas.height - rows * boxSize) / 2;

    for (let i = 0; i < userDenominator; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = offsetX + col * boxSize;
      const by = offsetY + row * boxSize;
      if (x >= bx && x <= bx + boxSize && y >= by && y <= by + boxSize) {
        return i;
      }
    }
    return null;
  }
}

function checkAnswer() {
  const shadedCount = selected.filter(Boolean).length;
  const userValue = shadedCount / userDenominator;

  const feedback = document.getElementById("feedback");
  const isCorrect = Math.abs(userValue - answerDecimal) < 0.01;

  if (isCorrect) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "#249ca4";
    score++;
  } else {
    feedback.textContent = `❌ Not quite. You shaded ${shadedCount}/${userDenominator} ≈ ${userValue.toFixed(2)}. Try again!`;
    feedback.style.color = "#fd5902";
    score = 0;
  }

  document.getElementById("score").textContent = `Score: ${score}`;
  answered = true;
}

// Start game
generateProblem();
