"use strict";
const $ = (id) => document.getElementById(id);
const emoji = { rock: "✊", paper: "✋", scissors: "✌️" };
const moves = Object.keys(emoji);
let score = { wins: 0, losses: 0, draws: 0, streak: 0, best: 0 };
try {
  const saved = JSON.parse(localStorage.getItem("rps-score"));
  if (
    saved &&
    moves.every((x) => typeof emoji[x] === "string") &&
    ["wins", "losses", "draws", "streak", "best"].every(
      (k) => Number.isInteger(saved[k]) && saved[k] >= 0,
    )
  )
    score = saved;
} catch {}
function render() {
  $("wins").textContent = score.wins;
  $("losses").textContent = score.losses;
  $("draws").textContent = score.draws;
  $("streak").textContent =
    `Current winning streak: ${score.streak} · Best: ${score.best}`;
}
function play(player) {
  const computer = moves[Math.floor(Math.random() * moves.length)];
  $("player-move").textContent = emoji[player];
  $("computer-move").textContent = emoji[computer];
  if (player === computer) {
    score.draws++;
    $("result").textContent = "It's a draw!";
  } else if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    score.wins++;
    score.streak++;
    score.best = Math.max(score.best, score.streak);
    $("result").textContent = "You win this round!";
  } else {
    score.losses++;
    score.streak = 0;
    $("result").textContent = "Computer wins this round. Try again!";
  }
  save();
}
function save() {
  try {
    localStorage.setItem("rps-score", JSON.stringify(score));
  } catch {}
  render();
}
document
  .querySelectorAll("[data-move]")
  .forEach((button) =>
    button.addEventListener("click", () => play(button.dataset.move)),
  );
$("reset").addEventListener("click", () => {
  if (!confirm("Reset all scores and streaks?")) return;
  score = { wins: 0, losses: 0, draws: 0, streak: 0, best: 0 };
  $("player-move").textContent = "—";
  $("computer-move").textContent = "—";
  $("result").textContent = "Scoreboard reset. Choose a move!";
  save();
});
render();
