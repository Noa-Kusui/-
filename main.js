function startBgm() {
  if (bgmStarted) return;

  bgm1.muted = true;
  bgm1.play().then(() => {
    bgm1.muted = false;
    bgmStarted = true;
  }).catch(() => {});
}

const WIDTH = 16;
const HEIGHT = 30;
const MINES = 99;
const TOTAL = WIDTH * HEIGHT;

let mines = [];
let opened = Array(TOTAL).fill(false);
let flagged = Array(TOTAL).fill(false);
let gameOver = false;
let bgmStarted = false;
let audioUnlocked = false;

const game = document.getElementById("game");

const bgm1 = document.getElementById("bgm1");
const bgm2 = document.getElementById("bgm2");
const clearSound = document.getElementById("clear");
const openSound = document.getElementById("openSound");
const flagSound = document.getElementById("flagSound");

/* ---------- Audio ---------- */

/* SE専用アンロック */
function unlockSE() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  [openSound, flagSound, bgm2, clearSound].forEach(a => {
    a.volume = 0;
    a.play().then(() => {
      a.pause();
      a.currentTime = 0;
      a.volume = 1;
    }).catch(() => {});
  });
}

function playSE(audio) {
  audio.currentTime = 0;
  audio.play();
}

function startBGM() {
  if (bgmStarted) return;
  bgmStarted = true;
  bgm1.play();
}

/* ---------- Utility ---------- */

function index(x, y) {
  return y * WIDTH + x;
}

function createMines() {
  while (mines.length < MINES) {
    const r = Math.floor(Math.random() * TOTAL);
    if (!mines.includes(r)) mines.push(r);
  }
}

function countMines(x, y) {
  let c = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
      if (mines.includes(index(nx, ny))) c++;
    }
  }
  return c;
}

/* ---------- Logic ---------- */

function openCell(x, y) {
  const i = index(x, y);
  if (opened[i] || flagged[i] || gameOver) return;

  opened[i] = true;
  const cell = document.getElementById("c" + i);
  cell.classList.add("open");

  if (mines.includes(i)) {
    gameOver = true;

    document.querySelectorAll(".open").forEach(e => {
      e.style.backgroundImage = "none";
    });

    mines.forEach(m => {
      const mc = document.getElementById("c" + m);
      mc.textContent = "🐈";
      mc.style.fontSize = "24px";
    });

    alert("!!!Game Over!!!");
    return;
  }

  const count = countMines(x, y);
  if (count > 0) {
    cell.textContent = count;
  } else {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < WIDTH && ny < HEIGHT) {
          openCell(nx, ny);
        }
      }
    }
  }
}

function isCleared() {
  return opened.filter(v => v).length === TOTAL - MINES;
}

/* ---------- Init ---------- */

function init() {
  createMines();

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = index(x, y);
      const cell = document.createElement("div");

      cell.id = "c" + i;
      cell.className = "cell";
      cell.style.backgroundPosition =
        `-${x * 40}px -${y * 40}px`;

      /* 左クリック */
      cell.onclick = () => {
        unlockSE();
        if (gameOver) return;

        startBGM();

        if (!opened[i] && !flagged[i]) {
          playSE(openSound);

          if (mines.includes(i)) {
            bgm1.pause();
            playSE(bgm2);
          }
        }

        openCell(x, y);

        if (!gameOver && isCleared()) {
          bgm1.pause();
          playSE(clearSound);
          document.getElementById("download").hidden = false;
        }
      };

      /* 右クリック */
      cell.oncontextmenu = e => {
        e.preventDefault();
        unlockSE();
        if (gameOver || opened[i]) return;

        startBGM();
        playSE(flagSound);

        flagged[i] = !flagged[i];
        cell.classList.toggle("flag");
      };

      game.appendChild(cell);
    }
  }
}

init();

