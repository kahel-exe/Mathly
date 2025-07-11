console.log("✅ game.js loaded");

let board, context;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let tileSize = 48;
let gameOver = false;
let ship, shipImg, meteorImg;
let bulletArray = [];
let meteorArray = [];
let score = 0;
let correctAnswer;
let question;
let stars = [];
let gameInitialized = false;
let isPaused = false;
let verticalMode = window.innerHeight > window.innerWidth;

// Load selected mode
const mode = localStorage.getItem("selectedMode");
const logicScript = document.createElement("script");
logicScript.src = `js/${mode}.js`;
logicScript.onload = () => {
  if (typeof window.generateQuestion !== "function") {
    console.error("❌ generateQuestion not defined.");
    return;
  }
  initGame();
};
document.body.appendChild(logicScript);

// Preload assets
shipImg = new Image();
meteorImg = new Image();
shipImg.src = "images/ship.png";
meteorImg.src = "images/meteor.png";

function initGame() {
  if (gameInitialized) return;
  gameInitialized = true;

  board = document.getElementById("board");
  context = board.getContext("2d");
  board.width = boardWidth;
  board.height = boardHeight;

  ship = verticalMode
    ? {
        x: boardWidth / 2 - tileSize,
        y: boardHeight - tileSize * 4,
        width: tileSize * 2,
        height: tileSize * 2,
        velocityX: tileSize,
      }
    : {
        x: tileSize * 2,
        y: boardHeight / 2 - tileSize,
        width: tileSize * 2,
        height: tileSize * 2,
        velocityY: tileSize,
      };

  stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * boardWidth,
    y: Math.random() * boardHeight,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 0.5 + 0.2,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  document.addEventListener("keydown", handleMove);
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") shoot();
  });

  document.getElementById("btn-left")?.addEventListener("click", () => moveShip("left"));
  document.getElementById("btn-right")?.addEventListener("click", () => moveShip("right"));
  document.getElementById("btn-shoot")?.addEventListener("click", shoot);

  const q = window.generateQuestion();
  question = { text: q.text };
  correctAnswer = q.answer;

  createMeteors();
  requestAnimationFrame(update);
}

function update() {
  if (isPaused || gameOver) {
    if (gameOver) drawGameOver();
    if (isPaused) drawPausedOverlay();
    return;
  }

  requestAnimationFrame(update);
  context.fillStyle = "black";
  context.fillRect(0, 0, boardWidth, boardHeight);

  drawStars();
  drawShip();
  drawBullets();
  drawMeteors();
  drawQuestion();
  drawScore();
  drawBottomUI();
}

function drawStars() {
  for (let star of stars) {
    if (verticalMode) {
      star.y += star.speed;
      if (star.y > boardHeight) star.y = 0;
    } else {
      star.x -= star.speed;
      if (star.x < 0) star.x = boardWidth;
    }
    context.fillStyle = `rgba(255,255,255,${star.opacity})`;
    context.beginPath();
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  }
}

function drawShip() {
  context.save();
  context.translate(ship.x + ship.width / 2, ship.y + ship.height / 2);
  context.rotate(verticalMode ? 0 : Math.PI / 2);
  context.drawImage(shipImg, -ship.width / 2, -ship.height / 2, ship.width, ship.height);
  context.restore();
}

function drawBullets() {
  for (let bullet of bulletArray) {
    if (verticalMode) bullet.y -= 15;
    else bullet.x += 15;

    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    for (let meteor of meteorArray) {
      if (!meteor.alive) continue;
      if (detectCollision(bullet, meteor)) {
        bullet.used = true;
        if (compareAnswers(meteor.answer, correctAnswer)) {
          meteor.alive = false;
          score++;
          const q = window.generateQuestion();
          question = { text: q.text };
          correctAnswer = q.answer;
          meteorArray = [];
          bulletArray = [];
          createMeteors();
        } else {
          gameOver = true;
          saveHighScoreIfNeeded();
        }
      }
    }
  }

  bulletArray = bulletArray.filter(
    (b) =>
      !b.used &&
      b.x >= 0 &&
      b.x <= boardWidth &&
      b.y >= 0 &&
      b.y <= boardHeight
  );
}

function drawMeteors() {
  let anyCorrectAlive = false;

  for (let meteor of meteorArray) {
    if (!meteor.alive) continue;

    if (verticalMode) meteor.y += meteor.speed;
    else meteor.x -= meteor.speed;

    if (compareAnswers(meteor.answer, correctAnswer)) anyCorrectAlive = true;
    if (
      (verticalMode && meteor.y > boardHeight) ||
      (!verticalMode && meteor.x + meteor.width < 0)
    ) {
      if (compareAnswers(meteor.answer, correctAnswer)) gameOver = true;
      meteor.alive = false;
    }

    context.save();
    context.translate(
      meteor.x + meteor.width / 2,
      meteor.y + meteor.height / 2
    );
    context.rotate(verticalMode ? 0 : Math.PI / 2);
    context.drawImage(
      meteorImg,
      -meteor.width / 2,
      -meteor.height / 2,
      meteor.width,
      meteor.height
    );
    context.restore();

    context.fillStyle = "white";
    context.font = "20px Montserrat";
    context.textAlign = "center";
    context.textBaseline = "middle";

    let headX, headY;

    if (verticalMode) {
      headX = meteor.x + meteor.width / 2;
      headY = meteor.y + tileSize * 1.75; // adjust this number to move the text lower/higher
    } else {
      headX = meteor.x - tileSize * 0.75;
      headY = meteor.y + meteor.height / 2;
    }

    context.fillText(meteor.answer, headX, headY);


    if (detectCollision(meteor, ship)) {
      gameOver = true;
      saveHighScoreIfNeeded();
    }
  }

  if (!anyCorrectAlive) gameOver = true;
}

function drawQuestion() {
  context.fillStyle = "white";
  context.font = "28px Montserrat";
  context.textAlign = "center";
  context.fillText(question.text, boardWidth / 2, 50);
}

function drawScore() {
  context.textAlign = "right";
  context.font = "20px Montserrat";
  context.fillText(`SCORE: ${score}`, boardWidth - 20, 30);
}

function drawBottomUI() {
  context.fillStyle = "#ccc";
  context.font = "16px Montserrat";
  context.textAlign = "left";
  context.fillText("⏴ BACK", 20, boardHeight - 20);
  context.textAlign = "right";
  context.fillText(isPaused ? "▶ RESUME" : "⏸ PAUSE", boardWidth - 20, boardHeight - 20);
}

function drawPausedOverlay() {
  context.fillStyle = "rgba(0, 0, 0, 0.6)";
  context.fillRect(0, 0, boardWidth, boardHeight);

  context.fillStyle = "white";
  context.font = "48px Montserrat";
  context.textAlign = "center";
  context.fillText("⏸", boardWidth / 2, boardHeight / 2);
}

function drawGameOver() {
  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.fillRect(0, 0, boardWidth, boardHeight);

  context.fillStyle = "white";
  context.font = "48px Montserrat";
  context.textAlign = "center";
  context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 60);
  context.font = "28px Montserrat";
  context.fillText(`Score: ${score}`, boardWidth / 2, boardHeight / 2 - 10);
  const high = getHighScore();
  context.font = "20px Montserrat";
  context.fillText(`High Score: ${high}`, boardWidth / 2, boardHeight / 2 + 20);

  drawButton(boardWidth / 2 - 110, boardHeight / 2 + 60, 100, 40, "RESTART");
  drawButton(boardWidth / 2 + 10, boardHeight / 2 + 60, 100, 40, "MENU");
}

function drawButton(x, y, w, h, text) {
  context.fillStyle = "#249ca4";
  context.beginPath();
  context.roundRect(x, y, w, h, 10);
  context.fill();

  context.fillStyle = "white";
  context.font = "16px Montserrat";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x + w / 2, y + h / 2);
}

function createMeteors() {
  const rows = [1, 3, 5, 7];
  const correctIndex = Math.floor(Math.random() * rows.length);

  // Set base size relative to the shorter screen side
  const baseSize = Math.min(boardWidth, boardHeight);
  const meteorW = baseSize * 0.07;
  const meteorH = baseSize * 0.25;

  for (let i = 0; i < rows.length; i++) {
    const x = verticalMode ? rows[i] * tileSize : boardWidth + Math.random() * 100;
    const y = verticalMode ? -Math.random() * 200 : rows[i] * tileSize;

    const answer = (i === correctIndex) ? correctAnswer : createWrongAnswer(correctAnswer);
    const speed = (["fraction", "decimal", "conversion"].includes(mode)) ? 0.5 : 0.75;

    meteorArray.push({
      x,
      y,
      width: meteorW,
      height: meteorH,
      speed,
      answer,
      alive: true
    });
  }
}

function createWrongAnswer(correct) {
  if (typeof correct === "number") {
    let offset = Math.floor(Math.random() * 5) + 1;
    return +(correct + offset * (Math.random() < 0.5 ? 1 : -1)).toFixed(2);
  } else if (typeof correct === "string" && correct.includes("/")) {
    let [num, den] = correct.split("/").map(Number);
    return `${num + (Math.random() < 0.5 ? 1 : -1)}/${den}`;
  }
  return `${correct}-wrong`;
}

function handleMove(e) {
  if (!verticalMode) {
    if (e.code === "ArrowUp" && ship.y > 0) ship.y -= ship.velocityY;
    else if (e.code === "ArrowDown" && ship.y + ship.height < boardHeight) ship.y += ship.velocityY;
  } else {
    if (e.code === "ArrowLeft" && ship.x > 0) ship.x -= ship.velocityX;
    else if (e.code === "ArrowRight" && ship.x + ship.width < boardWidth) ship.x += ship.velocityX;
  }
}

function moveShip(direction) {
  if (direction === "left" && ship.x > 0) ship.x -= ship.velocityX;
  else if (direction === "right" && ship.x + ship.width < boardWidth) ship.x += ship.velocityX;
}

function shoot() {
  bulletArray.push(
    verticalMode
      ? {
          x: ship.x + ship.width / 2 - 2,
          y: ship.y,
          width: 5,
          height: 15,
          used: false,
        }
      : {
          x: ship.x + ship.width,
          y: ship.y + ship.height / 2 - 2,
          width: 15,
          height: 5,
          used: false,
        }
  );
}

function detectCollision(a, b) {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;

  const dx = ax - bx;
  const dy = ay - by;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const radiusA = Math.min(a.width, a.height) / 2;
  const radiusB = Math.min(b.width, b.height) / 2;

  return distance < radiusA + radiusB;
}


function compareAnswers(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) < 0.01;
  }
  return a.toString().trim() === b.toString().trim();
}

function getHighScore() {
  const key = `highscore-${mode}`;
  return parseInt(localStorage.getItem(key) || "0");
}

function saveHighScoreIfNeeded() {
  const key = `highscore-${mode}`;
  const current = getHighScore();
  if (score > current) localStorage.setItem(key, score);
}

document.addEventListener("click", (e) => {
  const rect = board.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (gameOver) {
    if (x >= boardWidth / 2 - 110 && x <= boardWidth / 2 - 10 &&
        y >= boardHeight / 2 + 60 && y <= boardHeight / 2 + 100) {
      location.reload();
    }
    if (x >= boardWidth / 2 + 10 && x <= boardWidth / 2 + 110 &&
        y >= boardHeight / 2 + 60 && y <= boardHeight / 2 + 100) {
      window.location.href = "index.html";
    }
    return;
  }

  // Pause or Resume
  if (x >= boardWidth - 100 && x <= boardWidth - 20 && y >= boardHeight - 40 && y <= boardHeight - 10) {
    isPaused = !isPaused;
    if (!isPaused) update();
  }

  // Back
  if (x >= 20 && x <= 100 && y >= boardHeight - 40 && y <= boardHeight - 10) {
    window.location.href = "index.html";
  }

  // Tap center pause icon
  if (isPaused && x >= boardWidth / 2 - 40 && x <= boardWidth / 2 + 40 &&
      y >= boardHeight / 2 - 40 && y <= boardHeight / 2 + 40) {
    isPaused = false;
    update();
  }
});
