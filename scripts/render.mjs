// Генерирует все SVG профиля в assets/.
// Стиль: минимализм, глубокий космос, фиолетовый. Все анимации — SMIL, они работают в README на GitHub.
// Без GITHUB_TOKEN рисует только статичные картинки (шапка, проекты, подвал);
// с токеном (в GitHub Actions) ещё и карту активности по данным GraphQL API.
// DEMO=1 — активность на выдуманных данных для локального предпросмотра.
import { mkdirSync, writeFileSync } from "node:fs";

const USER = process.env.GH_USER || "6ixl";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// Тексты профиля: правь здесь.
const ROLE = "game & ui developer";
const YUDUI = { title: "YudUi", line: "Windows 11, reimagined." };
const YUDCORE = { title: "YudCore", line: "Dig to the core." };

const C = {
  space: "#06021a",
  card: "#0b0424",
  line: "#24124f",
  deep: "#2e1065",
  violet: "#6d28d9",
  purple: "#7c3aed",
  bright: "#a855f7",
  lilac: "#c084fc",
  pale: "#e9d5ff",
  white: "#f5f3ff",
  muted: "#8b7bb8",
};
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', Consolas, 'DejaVu Sans Mono', Menlo, monospace";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const save = (name, svg) => writeFileSync(new URL(name, OUT), svg.trim() + "\n");
const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${body}</svg>`;

// Детерминированный генератор случайных чисел, чтобы картинки не менялись между запусками.
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// Мерцающие звёзды в прямоугольнике.
function stars(n, x0, y0, w, h, maxR = 1.3) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = (x0 + rnd() * w).toFixed(0), y = (y0 + rnd() * h).toFixed(0), r = (rnd() * maxR + 0.3).toFixed(1);
    const dur = (rnd() * 4 + 2).toFixed(1), delay = (rnd() * 5).toFixed(1);
    const fill = rnd() < 0.25 ? C.lilac : C.white;
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"><animate attributeName="opacity" values=".1;.9;.1" dur="${dur}s" begin="-${delay}s" repeatCount="indefinite"/></circle>`;
  }
  return out;
}

// Четырёхлучевая искра.
const sparkle = (x, y, s, dur, delay) => `
  <path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${C.pale}">
    <animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="-${delay}s" repeatCount="indefinite"/>
  </path>`;

// Падающая звезда: пролетает за 1.1 с раз в period секунд.
const comet = (x, y, len, period, delay) => {
  const f = (1.1 / period).toFixed(3), h = (0.55 / period).toFixed(3);
  return `
  <g opacity="0">
    <path d="M0 0 L${len} 0" stroke="url(#comet)" stroke-width="1.4" stroke-linecap="round" transform="translate(${x} ${y}) rotate(155)"/>
    <animateTransform attributeName="transform" type="translate" values="0 0;-240 110;-240 110" keyTimes="0;${f};1" dur="${period}s" begin="${delay}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;0;0" keyTimes="0;${h};${f};1" dur="${period}s" begin="${delay}s" repeatCount="indefinite"/>
  </g>`;
};
const cometDef = `<linearGradient id="comet" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>`;

// Тёмная карточка с тонкой рамкой; glow — переливающаяся рамка для главного проекта.
function frame(w, h, id, glow = false) {
  const border = glow
    ? `<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${C.lilac}"/><stop offset=".35" stop-color="${C.purple}" stop-opacity=".2"/>
        <stop offset=".65" stop-color="${C.purple}" stop-opacity=".2"/><stop offset="1" stop-color="${C.lilac}"/>
        <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="8s" repeatCount="indefinite"/>
      </linearGradient>`
    : `<linearGradient id="${id}b"><stop offset="0" stop-color="${C.line}"/></linearGradient>`;
  return `
  <defs>
    ${border}
    <radialGradient id="${id}n" cx=".9" cy="0" r="1"><stop offset="0" stop-color="${C.purple}" stop-opacity=".2"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></radialGradient>
    <clipPath id="${id}c"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16"/></clipPath>
  </defs>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="${C.card}"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="url(#${id}n)"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" stroke="url(#${id}b)" stroke-width="${glow ? 1.4 : 1}"/>`;
}

// ---------- Шапка ----------
function header() {
  const W = 1200, H = 220, px = 1010, py = 92;
  return svg(W, H, `
  <defs>
    <radialGradient id="neb" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 110) scale(520 200)">
      <stop offset="0" stop-color="${C.purple}" stop-opacity=".28"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="planet" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="${C.pale}"/><stop offset=".35" stop-color="${C.bright}"/><stop offset=".8" stop-color="${C.deep}"/><stop offset="1" stop-color="#14052e"/>
    </radialGradient>
    <radialGradient id="halo"><stop offset=".5" stop-color="${C.bright}" stop-opacity=".3"/><stop offset="1" stop-color="${C.bright}" stop-opacity="0"/></radialGradient>
    <linearGradient id="ring" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <linearGradient id="name" gradientUnits="userSpaceOnUse" x1="460" y1="0" x2="740" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.white}"/><stop offset=".45" stop-color="${C.white}"/><stop offset=".5" stop-color="${C.lilac}"/><stop offset=".55" stop-color="${C.white}"/><stop offset="1" stop-color="${C.white}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-300 0;300 0" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <clipPath id="front"><rect x="${px - 120}" y="${py}" width="240" height="120"/></clipPath>
    ${cometDef}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${C.space}"/>
    <rect width="${W}" height="${H}" fill="url(#neb)"><animate attributeName="opacity" values=".7;1;.7" dur="9s" repeatCount="indefinite"/></rect>
    ${stars(90, 0, 0, W, H)}
    ${sparkle(250, 60, 6, 4, 0)}${sparkle(880, 175, 5, 5, 2)}
    ${comet(760, 20, 100, 7, 1.5)}
    ${comet(330, 30, 80, 9, 5)}
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="7s" repeatCount="indefinite"/>
      <circle cx="${px}" cy="${py}" r="60" fill="url(#halo)"/>
      <ellipse cx="${px}" cy="${py}" rx="70" ry="13" stroke="url(#ring)" stroke-width="1.4" opacity=".5" transform="rotate(-16 ${px} ${py})"/>
      <circle cx="${px}" cy="${py}" r="30" fill="url(#planet)"/>
      <g clip-path="url(#front)" transform="rotate(-16 ${px} ${py})">
        <ellipse cx="${px}" cy="${py}" rx="70" ry="13" stroke="url(#ring)" stroke-width="1.8"/>
      </g>
      <circle r="3" fill="${C.pale}">
        <animateMotion dur="10s" repeatCount="indefinite" path="M${px - 86.5} ${py + 24.8} A90 24 -16 1 1 ${px + 86.5} ${py - 24.8} A90 24 -16 1 1 ${px - 86.5} ${py + 24.8}"/>
      </circle>
    </g>
    <text x="600" y="118" text-anchor="middle" font-family="${SANS}" font-size="64" font-weight="300" fill="url(#name)" letter-spacing="16">6ixl</text>
    <rect x="600" y="138" width="0" height="1" fill="url(#rule)">
      <animate attributeName="x" from="600" to="480" dur="1.4s" fill="freeze"/>
      <animate attributeName="width" from="0" to="240" dur="1.4s" fill="freeze"/>
    </rect>
    <text x="600" y="166" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${C.muted}" letter-spacing="4">${esc(ROLE)}</text>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" stroke="${C.line}"/>`);
}

// ---------- YudUi: главный проект, с доком и окном, которое сворачивается в док ----------
function yudui() {
  const W = 548, H = 180, p = YUDUI;
  const icons = 5, iw = 18, ig = 9, dockY = 146;
  const dockW = icons * iw + (icons - 1) * ig + 20, dockX = 498 - dockW;
  const target = dockX + 10 + 2 * (iw + ig) + iw / 2;
  const shades = [C.lilac, C.bright, C.purple, C.violet, C.pale];
  let dock = "";
  for (let i = 0; i < icons; i++) {
    const cx = dockX + 10 + i * (iw + ig) + iw / 2;
    dock += `
    <g transform="translate(${cx} ${dockY - 5})"><g>
      <animateTransform attributeName="transform" type="scale" values="1;1;1.4;1;1" keyTimes="0;${(i * 0.08).toFixed(2)};${(i * 0.08 + 0.1).toFixed(2)};${(i * 0.08 + 0.2).toFixed(2)};1" dur="4s" repeatCount="indefinite"/>
      <rect x="${-iw / 2}" y="${-iw}" width="${iw}" height="${iw}" rx="5" fill="${shades[i]}" opacity=".9"/>
    </g></g>
    ${i % 2 === 0 ? `<circle cx="${cx}" cy="${dockY}" r="1.3" fill="${C.pale}"/>` : ""}`;
  }
  const wx = dockX + 6, wy = 34, ww = dockW - 12, wh = 70, ay = dockY - 14;
  const win = `
  <g transform="translate(${target} ${ay})"><g>
    <animateTransform attributeName="transform" type="scale" values="1;1;.04;.04;1.06;1;1" keyTimes="0;.42;.52;.66;.76;.82;1" dur="7s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;.45;.52;.66;.72;1" dur="7s" repeatCount="indefinite"/>
    <g transform="translate(${-target} ${-ay})">
      <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="8" fill="${C.space}" stroke="${C.line}"/>
      <circle cx="${wx + 12}" cy="${wy + 11}" r="3.5" fill="${C.lilac}"/>
      <circle cx="${wx + 23}" cy="${wy + 11}" r="3.5" fill="${C.bright}"/>
      <circle cx="${wx + 34}" cy="${wy + 11}" r="3.5" fill="${C.violet}"/>
      <rect x="${wx + 12}" y="${wy + 30}" width="${ww * 0.5}" height="4" rx="2" fill="${C.line}"/>
      <rect x="${wx + 12}" y="${wy + 46}" width="${ww * 0.35}" height="4" rx="2" fill="${C.line}"/>
      <rect x="${wx + ww - 34}" y="${wy + 27}" width="22" height="11" rx="5.5" fill="${C.purple}"/>
      <circle cx="${wx + ww - 18}" cy="${wy + 32.5}" r="3.8" fill="${C.white}"/>
    </g>
  </g></g>`;
  return svg(W, H, `
  ${frame(W, H, "yu", true)}
  <defs>
    <linearGradient id="yt" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="180" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.white}"/><stop offset=".45" stop-color="${C.pale}"/><stop offset=".5" stop-color="${C.bright}"/><stop offset=".55" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.white}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-160 0;160 0" dur="4s" repeatCount="indefinite"/>
    </linearGradient>
    ${cometDef}
  </defs>
  <g clip-path="url(#yuc)">
    ${stars(26, 8, 8, W - 16, H - 16, 1)}
    ${comet(520, 10, 60, 8, 3)}
  </g>
  ${win}
  <rect x="${dockX}" y="${dockY - 30}" width="${dockW}" height="34" rx="11" fill="${C.card}" fill-opacity=".9" stroke="${C.line}"/>
  ${dock}
  <text x="38" y="52" font-family="${MONO}" font-size="10" fill="${C.lilac}" letter-spacing="3">✦ FEATURED</text>
  <text x="36" y="104" font-family="${SANS}" font-size="40" font-weight="600" fill="url(#yt)">${esc(p.title)}</text>
  <text x="38" y="132" font-family="${SANS}" font-size="14" fill="${C.muted}">${esc(p.line)}</text>`);
}

// ---------- YudCore: бур копает к светящемуся ядру ----------
function yudcore() {
  const W = 340, H = 180, p = YUDCORE;
  const sx = 262, top = 30, bottom = 150;
  return svg(W, H, `
  ${frame(W, H, "yc")}
  <defs>
    <radialGradient id="core"><stop offset="0" stop-color="${C.pale}"/><stop offset=".45" stop-color="${C.bright}" stop-opacity=".6"/><stop offset="1" stop-color="${C.bright}" stop-opacity="0"/></radialGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset="1" stop-color="${C.lilac}" stop-opacity=".7"/></linearGradient>
  </defs>
  <g clip-path="url(#ycc)">${stars(16, 8, 8, W - 16, H - 16, 1)}</g>
  <path d="M${sx} ${top} V${bottom}" stroke="${C.line}" stroke-dasharray="2 5"/>
  <circle cx="${sx}" cy="${bottom}" r="16" fill="url(#core)">
    <animate attributeName="r" values="13;19;13" dur="3s" repeatCount="indefinite"/>
  </circle>
  <rect x="${sx - 1}" y="${top}" width="2" height="0" fill="url(#trail)">
    <animate attributeName="height" values="0;${bottom - top - 14};${bottom - top - 14};0" keyTimes="0;.8;.95;1" dur="6s" repeatCount="indefinite"/>
  </rect>
  <path d="M${sx - 6} -8 H${sx + 6} L${sx} 3 Z" fill="${C.pale}">
    <animateTransform attributeName="transform" type="translate" values="0 ${top};0 ${bottom - 14};0 ${bottom - 14};0 ${top}" keyTimes="0;.8;.95;1" dur="6s" repeatCount="indefinite"/>
  </path>
  <text x="38" y="104" font-family="${SANS}" font-size="30" font-weight="600" fill="${C.white}">${esc(p.title)}</text>
  <text x="38" y="132" font-family="${SANS}" font-size="14" fill="${C.muted}">${esc(p.line)}</text>`);
}

// ---------- Подвал: тонкая линия, по которой летит огонёк ----------
function footer() {
  const W = 1200, H = 40;
  return svg(W, H, `
  <defs>
    <linearGradient id="fl" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.lilac}" stop-opacity=".45"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <radialGradient id="fd"><stop offset="0" stop-color="${C.white}"/><stop offset=".4" stop-color="${C.lilac}" stop-opacity=".7"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="200" y="20" width="800" height="1" fill="url(#fl)"/>
  <circle cx="200" cy="20.5" r="8" fill="url(#fd)">
    <animate attributeName="cx" values="200;1000" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="6s" repeatCount="indefinite"/>
  </circle>`);
}

// ---------- Активность ----------
const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } }
    }
  }
}`;

async function fetchStats() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": USER },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!json.data?.user) throw new Error("GraphQL: " + JSON.stringify(json.errors || json));
  return json.data.user;
}

function currentStreak(days) {
  const today = new Date().toISOString().slice(0, 10);
  let i = days.length - 1, n = 0;
  if (i >= 0 && days[i].date === today && days[i].contributionCount === 0) i--;
  for (; i >= 0 && days[i].contributionCount > 0; i--) n++;
  return n;
}

// Карта активности с одной строкой итогов; по сетке пробегает световая полоса.
function activity(cal) {
  const cell = 10, gap = 3, step = cell + gap, top = 52;
  const weeks = cal.weeks, W = 900, H = 160;
  const left = Math.round((W - weeks.length * step + gap) / 2);
  const levels = ["#140a33", C.deep, C.violet, C.bright, C.pale];
  const max = Math.max(1, ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)));
  let cells = "";
  weeks.forEach((w, wi) => {
    w.contributionDays.forEach((d) => {
      const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
      const lvl = d.contributionCount === 0 ? 0 : Math.min(4, Math.ceil((d.contributionCount / max) * 4));
      cells += `<rect x="${left + wi * step}" y="${top + dow * step}" width="${cell}" height="${cell}" rx="2.5" fill="${levels[lvl]}"><title>${d.date}: ${d.contributionCount}</title></rect>`;
    });
  });
  const streak = currentStreak(weeks.flatMap((w) => w.contributionDays));
  const right = left + weeks.length * step - gap;
  return svg(W, H, `
  ${frame(W, H, "ac")}
  <defs>
    <linearGradient id="sweep" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.lilac}" stop-opacity=".18"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <clipPath id="grid"><rect x="${left}" y="${top}" width="${right - left}" height="${7 * step}"/></clipPath>
  </defs>
  <text x="${left}" y="34" font-family="${MONO}" font-size="11" fill="${C.muted}" letter-spacing="1">${cal.totalContributions} contributions this year</text>
  <text x="${right}" y="34" text-anchor="end" font-family="${MONO}" font-size="11" fill="${C.lilac}" letter-spacing="1">${streak}-day streak</text>
  ${cells}
  <g clip-path="url(#grid)">
    <rect x="${left - 100}" y="${top}" width="100" height="${7 * step}" fill="url(#sweep)">
      <animate attributeName="x" values="${left - 100};${left - 100};${W}" keyTimes="0;.6;1" dur="7s" repeatCount="indefinite"/>
    </rect>
  </g>`);
}

// ---------- Запуск ----------
save("header.svg", header());
save("project-yudui.svg", yudui());
save("project-yudcore.svg", yudcore());
save("footer.svg", footer());

if (TOKEN) {
  const u = await fetchStats();
  save("activity.svg", activity(u.contributionsCollection.contributionCalendar));
  console.log("activity updated");
} else if (process.env.DEMO) {
  // Демо-данные для локального предпросмотра.
  const weeks = [];
  const start = new Date(Date.now() - 52 * 7 * 864e5);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  for (let w = 0; w < 53; w++) {
    const contributionDays = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * 864e5);
      if (date > new Date()) break;
      contributionDays.push({ date: date.toISOString().slice(0, 10), contributionCount: rnd() < 0.5 ? 0 : Math.floor(rnd() * 12) });
    }
    if (contributionDays.length) weeks.push({ contributionDays });
  }
  save("activity.svg", activity({ totalContributions: 734, weeks }));
}
