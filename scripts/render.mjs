// Генерирует все SVG профиля в assets/.
// Стиль: минимализм, глубокий космос, фиолетовый. Все анимации — SMIL, они работают в README на GitHub.
// Без GITHUB_TOKEN рисует только статичные картинки (шапка, проекты, подвал);
// с токеном (в GitHub Actions) ещё и статистику по данным GraphQL API.
// DEMO=1 — статистика на выдуманных данных для локального предпросмотра.
import { mkdirSync, writeFileSync } from "node:fs";

const USER = process.env.GH_USER || "6ixl";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// ---------- Проекты: правь тексты здесь ----------
const YUDUI = {
  title: "YudUi",
  sub: "главный проект",
  desc: [
    "Библиотека интерфейсов в моём стиле:",
    "кнопки, переключатели, окна и анимации,",
    "которые одинаково выглядят во всех моих играх.",
  ],
  tags: ["UI", "компоненты", "анимации"],
};
const YUDCORE = {
  title: "YudCore",
  sub: "2D-копалка · Godot 4",
  desc: [
    "Прокопайся до ядра Земли — 5000 м, а дальше",
    "Луна, Марс, Европа, Титан и Венера.",
  ],
  tags: ["Godot 4.7", "GDScript", "Windows", "Web"],
};

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
function stars(n, x0, y0, w, h, maxR = 1.4) {
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
    <path d="M0 0 L${len} 0" stroke="url(#comet)" stroke-width="1.6" stroke-linecap="round" transform="translate(${x} ${y}) rotate(155)"/>
    <animateTransform attributeName="transform" type="translate" values="0 0;-260 120;-260 120" keyTimes="0;${f};1" dur="${period}s" begin="${delay}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;0;0" keyTimes="0;${h};${f};1" dur="${period}s" begin="${delay}s" repeatCount="indefinite"/>
  </g>`;
};

const cometDef = `<linearGradient id="comet" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>`;

function frame(w, h, id, { glow = false } = {}) {
  const border = glow
    ? `<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${C.lilac}"/><stop offset=".35" stop-color="${C.purple}" stop-opacity=".25"/>
        <stop offset=".65" stop-color="${C.purple}" stop-opacity=".25"/><stop offset="1" stop-color="${C.lilac}"/>
        <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="8s" repeatCount="indefinite"/>
      </linearGradient>`
    : `<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.line}"/><stop offset="1" stop-color="${C.line}"/></linearGradient>`;
  return `
  <defs>
    ${border}
    <radialGradient id="${id}n" cx=".85" cy="0" r="1"><stop offset="0" stop-color="${C.purple}" stop-opacity=".22"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="${C.card}"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="url(#${id}n)"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" stroke="url(#${id}b)" stroke-width="${glow ? 1.6 : 1}"/>`;
}

function pills(tags, x, y) {
  return tags.map((t) => {
    const w = t.length * 7 + 22;
    const s = `<rect x="${x}" y="${y}" width="${w}" height="24" rx="12" stroke="${C.line}"/>
    <text x="${x + w / 2}" y="${y + 16}" text-anchor="middle" font-family="${SANS}" font-size="12" fill="${C.lilac}">${esc(t)}</text>`;
    x += w + 8;
    return s;
  }).join("");
}

// ---------- Шапка ----------
function header() {
  const W = 1200, H = 300, px = 930, py = 150;
  return svg(W, H, `
  <defs>
    <radialGradient id="neb1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(860 120) scale(420 260)">
      <stop offset="0" stop-color="${C.purple}" stop-opacity=".35"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="neb2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 260) scale(380 200)">
      <stop offset="0" stop-color="${C.violet}" stop-opacity=".22"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="planet" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="${C.pale}"/><stop offset=".35" stop-color="${C.bright}"/><stop offset=".8" stop-color="${C.deep}"/><stop offset="1" stop-color="#14052e"/>
    </radialGradient>
    <radialGradient id="halo"><stop offset=".55" stop-color="${C.bright}" stop-opacity=".35"/><stop offset="1" stop-color="${C.bright}" stop-opacity="0"/></radialGradient>
    <linearGradient id="ring" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <linearGradient id="name" gradientUnits="userSpaceOnUse" x1="90" y1="0" x2="470" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.white}"/><stop offset=".45" stop-color="${C.white}"/><stop offset=".5" stop-color="${C.lilac}"/><stop offset=".55" stop-color="${C.white}"/><stop offset="1" stop-color="${C.white}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-380 0;380 0" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    <clipPath id="front"><rect x="${px - 200}" y="${py}" width="400" height="200"/></clipPath>
    ${cometDef}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${C.space}"/>
    <rect width="${W}" height="${H}" fill="url(#neb1)">
      <animate attributeName="opacity" values=".7;1;.7" dur="9s" repeatCount="indefinite"/>
    </rect>
    <rect width="${W}" height="${H}" fill="url(#neb2)"/>
    ${stars(110, 0, 0, W, H)}
    ${sparkle(640, 60, 7, 4, 0)}${sparkle(1110, 250, 6, 5, 2)}${sparkle(520, 250, 5, 6, 3.5)}
    ${comet(820, 30, 120, 7, 1.5)}
    ${comet(1150, 70, 90, 9, 5)}

    <!-- планета с кольцом -->
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="7s" repeatCount="indefinite"/>
      <circle cx="${px}" cy="${py}" r="110" fill="url(#halo)"/>
      <ellipse cx="${px}" cy="${py}" rx="130" ry="26" stroke="url(#ring)" stroke-width="2" opacity=".55" transform="rotate(-16 ${px} ${py})"/>
      <circle cx="${px}" cy="${py}" r="62" fill="url(#planet)"/>
      <g clip-path="url(#front)" transform="rotate(-16 ${px} ${py})">
        <ellipse cx="${px}" cy="${py}" rx="130" ry="26" stroke="url(#ring)" stroke-width="2.4"/>
        <ellipse cx="${px}" cy="${py}" rx="108" ry="19" stroke="${C.lilac}" stroke-width="1" opacity=".4"/>
      </g>
      <!-- спутник -->
      <circle r="5" fill="${C.pale}">
        <animateMotion dur="11s" repeatCount="indefinite" path="M${px - 163.4} ${py + 46.9} A170 46 -16 1 1 ${px + 163.4} ${py - 46.9} A170 46 -16 1 1 ${px - 163.4} ${py + 46.9}"/>
      </circle>
    </g>

    <!-- имя -->
    <text x="90" y="150" font-family="${SANS}" font-size="92" font-weight="300" fill="url(#name)" letter-spacing="14">6ixl</text>
    <rect x="94" y="176" height="1.5" width="0" fill="${C.lilac}">
      <animate attributeName="width" from="0" to="300" dur="1.4s" begin=".2s" fill="freeze"/>
    </rect>
    <text x="94" y="210" font-family="${MONO}" font-size="16" fill="${C.lilac}" letter-spacing="3">game &amp; ui developer</text>
    <text x="94" y="238" font-family="${MONO}" font-size="13" fill="${C.muted}" letter-spacing="1">// сейчас строю YudUi</text>
    <rect x="290" y="226" width="8" height="15" fill="${C.lilac}">
      <animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/>
    </rect>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" stroke="${C.line}"/>`);
}

// ---------- Заголовок раздела: тонкая линия и подпись ----------
function section(title) {
  const W = 900, H = 40, tw = title.length * 9.6 + 36;
  const l = 450 - tw / 2, r = 450 + tw / 2;
  return svg(W, H, `
  <defs>
    <linearGradient id="ll" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset="1" stop-color="${C.lilac}" stop-opacity=".6"/></linearGradient>
    <linearGradient id="lr" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity=".6"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="${l - 260}" y="20" width="260" height="1" fill="url(#ll)"/>
  <rect x="${r}" y="20" width="260" height="1" fill="url(#lr)"/>
  <text x="450" y="25" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${C.lilac}" letter-spacing="4">${esc(title.toUpperCase())}</text>`);
}

// ---------- YudUi: главная карточка ----------
function yudui() {
  const W = 900, H = 340, p = YUDUI;
  // Мокап окна с компонентами справа.
  const mx = 540, my = 62, mw = 310, mh = 220;
  const ui = `
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="6s" repeatCount="indefinite"/>
    <rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="14" fill="${C.space}" stroke="${C.line}"/>
    <circle cx="${mx + 20}" cy="${my + 18}" r="4" fill="${C.lilac}"/><circle cx="${mx + 34}" cy="${my + 18}" r="4" fill="${C.purple}"/><circle cx="${mx + 48}" cy="${my + 18}" r="4" fill="${C.deep}"/>
    <path d="M${mx} ${my + 36} H${mx + mw}" stroke="${C.line}"/>

    <!-- кнопка с пульсом -->
    <rect x="${mx + 22}" y="${my + 56}" width="130" height="36" rx="10" fill="url(#btn)"/>
    <rect x="${mx + 22}" y="${my + 56}" width="130" height="36" rx="10" stroke="${C.lilac}" fill="none">
      <animate attributeName="stroke-opacity" values=".9;0" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-width" values="1;8" dur="2s" repeatCount="indefinite"/>
    </rect>
    <text x="${mx + 87}" y="${my + 79}" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="600" fill="${C.white}">Играть</text>

    <!-- переключатель -->
    <rect x="${mx + 222}" y="${my + 62}" width="56" height="26" rx="13" fill="${C.deep}">
      <animate attributeName="fill" values="${C.deep};${C.purple};${C.purple};${C.deep};${C.deep}" keyTimes="0;.1;.5;.6;1" dur="4s" repeatCount="indefinite"/>
    </rect>
    <circle cx="${mx + 235}" cy="${my + 75}" r="9" fill="${C.white}">
      <animate attributeName="cx" values="${mx + 235};${mx + 265};${mx + 265};${mx + 235};${mx + 235}" keyTimes="0;.1;.5;.6;1" dur="4s" repeatCount="indefinite"/>
    </circle>

    <!-- ползунок -->
    <rect x="${mx + 22}" y="${my + 122}" width="256" height="4" rx="2" fill="${C.line}"/>
    <rect x="${mx + 22}" y="${my + 122}" width="60" height="4" rx="2" fill="${C.lilac}">
      <animate attributeName="width" values="60;210;60" dur="5s" repeatCount="indefinite"/>
    </rect>
    <circle cx="${mx + 82}" cy="${my + 124}" r="8" fill="${C.white}" stroke="${C.purple}" stroke-width="3">
      <animate attributeName="cx" values="${mx + 82};${mx + 232};${mx + 82}" dur="5s" repeatCount="indefinite"/>
    </circle>

    <!-- прогресс -->
    <text x="${mx + 22}" y="${my + 162}" font-family="${MONO}" font-size="11" fill="${C.muted}">загрузка</text>
    <rect x="${mx + 22}" y="${my + 172}" width="256" height="8" rx="4" fill="${C.line}"/>
    <rect x="${mx + 22}" y="${my + 172}" width="0" height="8" rx="4" fill="url(#btn)">
      <animate attributeName="width" values="0;256;256;0" keyTimes="0;.7;.9;1" dur="3.5s" repeatCount="indefinite"/>
    </rect>
    <circle cx="${mx + 266}" cy="${my + 157}" r="7" stroke="${C.lilac}" stroke-width="2" stroke-dasharray="30 14">
      <animateTransform attributeName="transform" type="rotate" from="0 ${mx + 266} ${my + 157}" to="360 ${mx + 266} ${my + 157}" dur="1.2s" repeatCount="indefinite"/>
    </circle>
  </g>`;

  const desc = p.desc.map((l, i) =>
    `<text x="48" y="${170 + i * 24}" font-family="${SANS}" font-size="15" fill="${C.pale}">${esc(l)}</text>`).join("");

  return svg(W, H, `
  ${frame(W, H, "yu", { glow: true })}
  <defs>
    <linearGradient id="btn" x1="0" x2="1"><stop offset="0" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.bright}"/></linearGradient>
    <linearGradient id="yt" gradientUnits="userSpaceOnUse" x1="48" y1="0" x2="250" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.white}"/><stop offset=".45" stop-color="${C.pale}"/><stop offset=".5" stop-color="${C.bright}"/><stop offset=".55" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.white}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-220 0;220 0" dur="4s" repeatCount="indefinite"/>
    </linearGradient>
    <clipPath id="yc"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18"/></clipPath>
    ${cometDef}
  </defs>
  <g clip-path="url(#yc)">
    ${stars(40, 10, 10, W - 20, H - 20, 1.1)}
    <ellipse cx="${mx + mw / 2}" cy="${my + mh / 2}" rx="220" ry="150" stroke="${C.line}" stroke-dasharray="2 8"/>
    <circle r="4" fill="${C.lilac}">
      <animateMotion dur="14s" repeatCount="indefinite" path="M${mx + mw / 2 - 220} ${my + mh / 2} a220 150 0 1 1 440 0 a220 150 0 1 1 -440 0"/>
    </circle>
    ${comet(860, 20, 80, 8, 3)}
  </g>
  ${ui}

  <rect x="48" y="44" width="104" height="24" rx="12" fill="${C.deep}"/>
  <text x="100" y="60" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${C.pale}" letter-spacing="2">✦ FEATURED</text>
  <text x="46" y="128" font-family="${SANS}" font-size="56" font-weight="700" fill="url(#yt)" letter-spacing="1">${esc(p.title)}</text>
  ${desc}
  ${pills(p.tags, 48, 262)}
  <text x="48" y="314" font-family="${MONO}" font-size="12" fill="${C.muted}">github.com/${USER}/${esc(p.title)}  →</text>`);
}

// ---------- YudCore: вторая карточка ----------
function yudcore() {
  const W = 900, H = 200, p = YUDCORE;
  // Шахта справа: слои грунта, бур едет вниз к ядру.
  const sx = 620, sy = 24, sw = 240, sh = 152;
  const layers = ["#2a1458", "#24104d", "#1d0c40", "#170934", "#3b0764"];
  const lh = sh / layers.length;
  let strata = "";
  layers.forEach((c, i) => {
    strata += `<rect x="${sx}" y="${sy + i * lh}" width="${sw}" height="${lh + 0.5}" fill="${c}"/>`;
    for (let k = 0; k < 6; k++) {
      const ox = (sx + 10 + rnd() * (sw - 20)).toFixed(0), oy = (sy + i * lh + 6 + rnd() * (lh - 12)).toFixed(0);
      strata += `<rect x="${ox}" y="${oy}" width="4" height="4" fill="${i === 4 ? C.lilac : C.violet}" opacity="${i === 4 ? 0.9 : 0.5}"/>`;
    }
  });
  const shaftX = sx + sw / 2;
  const desc = p.desc.map((l, i) =>
    `<text x="48" y="${104 + i * 22}" font-family="${SANS}" font-size="14" fill="${C.pale}">${esc(l)}</text>`).join("");
  return svg(W, H, `
  ${frame(W, H, "yc")}
  <defs>
    <clipPath id="mine"><rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="10"/></clipPath>
    <radialGradient id="core"><stop offset="0" stop-color="${C.pale}"/><stop offset=".5" stop-color="${C.bright}" stop-opacity=".6"/><stop offset="1" stop-color="${C.bright}" stop-opacity="0"/></radialGradient>
  </defs>
  <g clip-path="url(#mine)">
    ${strata}
    <circle cx="${shaftX}" cy="${sy + sh}" r="34" fill="url(#core)">
      <animate attributeName="r" values="28;38;28" dur="3s" repeatCount="indefinite"/>
    </circle>
    <rect x="${shaftX - 7}" y="${sy}" width="14" height="0" fill="${C.space}">
      <animate attributeName="height" values="0;${sh - 18};${sh - 18};0" keyTimes="0;.8;.95;1" dur="6s" repeatCount="indefinite"/>
    </rect>
    <path d="M${shaftX - 8} -10 H${shaftX + 8} L${shaftX} 4 Z" fill="${C.pale}">
      <animateTransform attributeName="transform" type="translate" values="0 ${sy + 4};0 ${sy + sh - 14};0 ${sy + sh - 14};0 ${sy + 4}" keyTimes="0;.8;.95;1" dur="6s" repeatCount="indefinite"/>
    </path>
  </g>
  <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="10" stroke="${C.line}"/>
  <text x="${sx - 12}" y="${sy + 12}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${C.muted}">0 м</text>
  <text x="${sx - 12}" y="${sy + sh}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${C.lilac}">5000 м</text>

  <text x="48" y="64" font-family="${SANS}" font-size="32" font-weight="700" fill="${C.white}">${esc(p.title)}</text>
  <text x="${48 + p.title.length * 19 + 14}" y="64" font-family="${MONO}" font-size="12" fill="${C.muted}">${esc(p.sub)}</text>
  ${desc}
  ${pills(p.tags, 48, 150)}`);
}

// ---------- Подвал ----------
function footer() {
  const W = 1200, H = 70;
  return svg(W, H, `
  <defs>
    <linearGradient id="fl" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.lilac}" stop-opacity=".5"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <radialGradient id="fd"><stop offset="0" stop-color="${C.white}"/><stop offset=".4" stop-color="${C.lilac}" stop-opacity=".7"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="100" y="22" width="1000" height="1" fill="url(#fl)"/>
  <circle cx="100" cy="22.5" r="9" fill="url(#fd)">
    <animate attributeName="cx" values="100;1100" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="6s" repeatCount="indefinite"/>
  </circle>
  <text x="600" y="54" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${C.muted}" letter-spacing="4">✦  6ixl  ·  где-то между звёзд  ✦</text>`);
}

// ---------- Статистика ----------
const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, first: 100, privacy: PUBLIC) {
      totalCount
      nodes { stargazerCount }
    }
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
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

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n));

function streaks(days) {
  const today = new Date().toISOString().slice(0, 10);
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let i = days.length - 1, current = 0;
  if (i >= 0 && days[i].date === today && days[i].contributionCount === 0) i--;
  for (; i >= 0 && days[i].contributionCount > 0; i--) current++;
  return { current, longest };
}

// Одна строка чисел.
function statsCard(u) {
  const W = 900, H = 120;
  const cc = u.contributionsCollection;
  const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const { current, longest } = streaks(days);
  const cols = [
    [fmt(cc.contributionCalendar.totalContributions), "вклад за год"],
    [fmt(cc.totalCommitContributions + cc.restrictedContributionsCount), "коммитов"],
    [current, "дней подряд"],
    [longest, "лучшая серия"],
    [fmt(u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0)), "звёзд"],
  ];
  const cw = W / cols.length;
  const body = cols.map(([v, label], i) => {
    const x = cw * i + cw / 2;
    return `
    <g>
      <text x="${x}" y="62" text-anchor="middle" font-family="${SANS}" font-size="30" font-weight="300" fill="${C.white}">${v}</text>
      <text x="${x}" y="88" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${C.muted}" letter-spacing="1">${label}</text>
    </g>
    ${i ? `<rect x="${cw * i}" y="38" width="1" height="50" fill="${C.line}"/>` : ""}`;
  }).join("");
  return svg(W, H, `${frame(W, H, "st")}${body}`);
}

function heatmap(weeks) {
  const cell = 11, gap = 4, step = cell + gap, top = 30;
  const W = 900, H = 160, left = Math.round((W - weeks.length * step + gap) / 2);
  const levels = ["#140a33", C.deep, C.violet, C.bright, C.pale];
  const max = Math.max(1, ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)));
  let cells = "";
  weeks.forEach((w, wi) => {
    const x = left + wi * step;
    let col = "";
    w.contributionDays.forEach((d) => {
      const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
      const lvl = d.contributionCount === 0 ? 0 : Math.min(4, Math.ceil((d.contributionCount / max) * 4));
      col += `<rect x="${x}" y="${top + dow * step}" width="${cell}" height="${cell}" rx="3" fill="${levels[lvl]}"><title>${d.date}: ${d.contributionCount}</title></rect>`;
    });
    cells += col;
  });
  // Световая полоса раз в несколько секунд пробегает по сетке.
  return svg(W, H, `
  ${frame(W, H, "hm")}
  <defs>
    <linearGradient id="sweep" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.lilac}" stop-opacity=".18"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <clipPath id="grid"><rect x="${left}" y="${top}" width="${weeks.length * step}" height="${7 * step}"/></clipPath>
  </defs>
  ${cells}
  <g clip-path="url(#grid)">
    <rect x="-120" y="${top}" width="120" height="${7 * step}" fill="url(#sweep)">
      <animate attributeName="x" values="${left - 120};${left - 120};${W}" keyTimes="0;.6;1" dur="7s" repeatCount="indefinite"/>
    </rect>
  </g>`);
}

// ---------- Запуск ----------
save("header.svg", header());
save("sec-projects.svg", section("проекты"));
save("sec-stats.svg", section("активность"));
save("project-yudui.svg", yudui());
save("project-yudcore.svg", yudcore());
save("footer.svg", footer());

if (TOKEN) {
  const u = await fetchStats();
  save("stats.svg", statsCard(u));
  save("activity.svg", heatmap(u.contributionsCollection.contributionCalendar.weeks));
  console.log("stats updated");
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
  const u = {
    followers: { totalCount: 1 },
    repositories: { totalCount: 3, nodes: [{ stargazerCount: 2 }, { stargazerCount: 1 }] },
    contributionsCollection: { totalCommitContributions: 512, restrictedContributionsCount: 0, contributionCalendar: { totalContributions: 734, weeks } },
  };
  save("stats.svg", statsCard(u));
  save("activity.svg", heatmap(weeks));
}
