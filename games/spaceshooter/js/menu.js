console.log("✅ menu.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const difficulties = [
    { label: "+ and -", mode: "addition-subtraction" },
    { label: "× and ÷", mode: "multiplication-division" },
    { label: "FRACTIONS", mode: "fraction" },
    { label: "DECIMALS", mode: "decimal" },
    { label: "CONVERSION", mode: "conversion" }
  ];

  let currentIndex = 0;

  // DOM Elements
  const labelEl = document.getElementById("difficulty");
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const scoreListEl = document.getElementById("score-list");

  function updateLabel() {
    labelEl.textContent = difficulties[currentIndex].label;
  }

  function loadHighscores() {
    scoreListEl.innerHTML = "";
    for (const { label, mode } of difficulties) {
      const score = localStorage.getItem(`highscore-${mode}`) || 0;
      const div = document.createElement("div");
      div.className = "score-entry";
      div.textContent = `${label}: ${score}`;
      scoreListEl.appendChild(div);
    }
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + difficulties.length) % difficulties.length;
    updateLabel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % difficulties.length;
    updateLabel();
  });

  playBtn.addEventListener("click", () => {
    const selectedMode = difficulties[currentIndex].mode;
    localStorage.setItem("selectedMode", selectedMode);
    window.location.href = "game.html";
  });

  updateLabel();
  loadHighscores();
});
