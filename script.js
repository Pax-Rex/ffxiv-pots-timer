let northMinute = null;
let southMinute = null;
let nextPot = null;

/* ===== SETTING TIMES ===== */
function setFromNow(side) {
  const minute = new Date().getMinutes();
  if (side === "North") {
    applyTimes(minute, (minute + 30) % 60);
  } else {
    applyTimes((minute + 30) % 60, minute);
  }
}

function setFromInput() {
  const side = document.getElementById("manualSide").value;
  const minute = parseInt(document.getElementById("manualMinute").value, 10);
  if (isNaN(minute) || minute < 0 || minute > 59) return;

  if (side === "North") {
    applyTimes(minute, (minute + 30) % 60);
  } else {
    applyTimes((minute + 30) % 60, minute);
  }
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);

  const south = params.get("south");
  const north = params.get("north");

  // Prefer explicit north if both are present
  if (north !== null) {
    const n = parseInt(north, 10);
    if (!isNaN(n) && n >= 0 && n <= 59) {
      applyTimes(n, (n + 30) % 60);
    }
    return;
  }

  if (south !== null) {
    const s = parseInt(south, 10);
    if (!isNaN(s) && s >= 0 && s <= 59) {
      applyTimes((s + 30) % 60, s);
    }
  }
}

function applyTimes(north, south) {
  northMinute = north;
  southMinute = south;
  renderAlarms();
}

/* ===== RENDER ===== */
function renderAlarms() {
  const container = document.getElementById("alarms");
  container.innerHTML = "";

  ["North", "South"].forEach(name => {
    const minute = name === "North" ? northMinute : southMinute;
    const commandText = `/alarm &quot;${name} Pots FATE&quot; lt rp ${minute} 10 se01`;

    const section = document.createElement("div");
    section.className = "pot-section";
    section.id = `${name}-section`;

    section.innerHTML = `
      <div class="pot-title">${name.toUpperCase()} POTS</div>
      <div class="divider"></div>
      <div class="spawn-time">🕒 Spawn Time: ${formatMinute(minute)}</div>
      <div class="pot-timer" id="${name}-timer">⏳ Calculating…</div>
      <div class="command-row">
        <div class="command-text">${commandText}</div>
        <button onclick="copyCommand('${commandText}')">Copy</button>
      </div>
    `;

    container.appendChild(section);
  });
}


/* ===== COPY ===== */
function copyCommand(text) {
  navigator.clipboard.writeText(text);
  const s = document.getElementById("status");
  s.textContent = `✓ Copied: ${text}`;
  s.classList.add("show");
  setTimeout(() => s.classList.remove("show"), 2000);
}

function copyShareLink() {
  const url = `${window.location.origin}${window.location.pathname}?north=${northMinute}`;
  copyCommand(url);

}

/* ===== COUNTDOWNS + NEXT ===== */
function updateTimers() {
  if (northMinute === null) return;

  const now = new Date();
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const times = {
    North: getDiff(northMinute, nowSec),
    South: getDiff(southMinute, nowSec)
  };

  nextPot = times.North <= times.South ? "North" : "South";

  ["North", "South"].forEach(name => {
    const diff = times[name];
    const m = Math.floor(diff / 60);
    const s = diff % 60;

    const timer = document.getElementById(`${name}-timer`);

    if (timer) {
      timer.textContent = `⏳ Spawns in: ${m}:${s.toString().padStart(2,"0")}`;
      if (name === nextPot) {
        timer.classList.add("next");
        timer.classList.remove("later");
      } else {
        timer.classList.add("later");
        timer.classList.remove("next");
      }
    }
  });
}

function getDiff(minute, nowSec) {
  let target = Math.floor(nowSec / 3600) * 3600 + minute * 60;
  if (target <= nowSec) target += 3600;
  return target - nowSec;
}

function formatMinute(minute) {
  return `xx:${minute.toString().padStart(2,"0")}`;
}

document.getElementById("shareLinkBtn")
  ?.addEventListener("click", copyShareLink);
setInterval(updateTimers, 1000);
loadFromURL();

