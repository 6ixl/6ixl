// Генерирует все SVG профиля в assets/.
// Без GITHUB_TOKEN рисует только статичные картинки (шапка, строка, карточки проектов);
// с токеном (в GitHub Actions) ещё и статистику по данным GraphQL API.
import { mkdirSync, writeFileSync } from "node:fs";

const USER = process.env.GH_USER || "6ixl";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = {
  bg: "#0d0221",
  card: "#140733",
  deep: "#2e1065",
  violet: "#5b21b6",
  purple: "#7c3aed",
  bright: "#a855f7",
  lilac: "#c084fc",
  pale: "#e9d5ff",
  white: "#f5f3ff",
  muted: "#a78bfa",
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

// Периодичная волна шириной 2*period — её сдвигают на period для бесшовной анимации.
function wave(period, base, amp, phase = 0) {
  let d = `M0 ${base}`;
  for (let x = 0; x <= period * 2; x += 20) {
    d += ` L${x} ${(base + Math.sin((x / period) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  }
  return d;
}

function cardFrame(w, h, id) {
  return `
  <defs>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.lilac}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>
    <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c0a45"/><stop offset="1" stop-color="${C.bg}"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="url(#${id}f)" stroke="url(#${id}b)" stroke-width="2"/>`;
}

// ---------- Шапка ----------
function header() {
  const W = 1200, H = 320;
  let stars = "";
  for (let i = 0; i < 70; i++) {
    const x = (rnd() * W).toFixed(0), y = (rnd() * 230).toFixed(0), r = (rnd() * 1.6 + 0.4).toFixed(1);
    const dur = (rnd() * 3 + 2).toFixed(1), delay = (rnd() * 4).toFixed(1);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}"><animate attributeName="opacity" values="0.15;1;0.15" dur="${dur}s" begin="-${delay}s" repeatCount="indefinite"/></circle>`;
  }
  const edge = wave(W, 262, 16) + ` L${W * 2} 0 L0 0 Z`;
  const layer = (base, amp, phase, color, op, dur) =>
    `<path d="${wave(W, base, amp, phase)} L${W * 2} ${H} L0 ${H} Z" fill="${color}" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="-${W} 0" dur="${dur}s" repeatCount="indefinite"/></path>`;
  return svg(W, H, `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12032b"/><stop offset=".45" stop-color="#3b0764"/><stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${C.lilac}" stop-opacity=".55"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></radialGradient>
    <linearGradient id="title" gradientUnits="userSpaceOnUse" x1="420" y1="0" x2="780" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.pale}"/><stop offset=".45" stop-color="#ffffff"/><stop offset=".5" stop-color="${C.lilac}"/><stop offset=".55" stop-color="#ffffff"/><stop offset="1" stop-color="${C.pale}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-400 0;400 0" dur="4s" repeatCount="indefinite"/>
    </linearGradient>
    <filter id="neon" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="10" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="clip"><path d="${edge}"><animateTransform attributeName="transform" type="translate" from="0 0" to="-${W} 0" dur="12s" repeatCount="indefinite"/></path></clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="200" cy="80" r="260" fill="url(#glow)"><animate attributeName="cx" values="200;420;200" dur="14s" repeatCount="indefinite"/></circle>
    <circle cx="1000" cy="220" r="300" fill="url(#glow)"><animate attributeName="cx" values="1000;780;1000" dur="18s" repeatCount="indefinite"/></circle>
    ${stars}
    ${layer(215, 14, 1.5, C.lilac, 0.10, 16)}
    ${layer(232, 12, 3.2, C.purple, 0.18, 10)}
  </g>
  <text x="600" y="148" text-anchor="middle" font-family="${SANS}" font-size="112" font-weight="800" fill="url(#title)" filter="url(#neon)" letter-spacing="4">6ixl</text>
  <text x="600" y="198" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="600" fill="${C.pale}" letter-spacing="6">GAME DEVELOPER · GODOT · JAVASCRIPT</text>
  `);
}

// ---------- Печатающаяся строка ----------
function typing() {
  const lines = [
    "Привет! Я 6ixl — разработчик игр",
    "Делаю игры на Godot и JavaScript",
    "375 мини-игр в одном APK",
    "Копаю до ядра Земли в YudCore",
    "Обожаю процедурную генерацию",
  ];
  const W = 900, H = 56, FS = 24, CW = FS * 0.6, slot = 4, total = slot * lines.length;
  const t = (s) => (s / total).toFixed(4);
  let body = "";
  lines.forEach((line, i) => {
    const w = Math.round(line.length * CW), x0 = Math.round((W - w) / 2);
    const s = i * slot + 0.01, typed = s + 1.6, erase = s + slot - 0.6, end = s + slot - 0.02;
    const keys = `0;${t(s)};${t(typed)};${t(erase)};${t(end)};1`;
    body += `
    <clipPath id="c${i}"><rect x="${x0}" y="0" height="${H}" width="0">
      <animate attributeName="width" values="0;0;${w};${w};0;0" keyTimes="${keys}" dur="${total}s" repeatCount="indefinite"/></rect></clipPath>
    <text x="${x0}" y="37" font-family="${MONO}" font-size="${FS}" font-weight="600" fill="url(#tg)" clip-path="url(#c${i})" textLength="${w}" lengthAdjust="spacingAndGlyphs">${esc(line)}</text>`;
  });
  return svg(W, H, `
  <defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.bright}"/></linearGradient></defs>
  ${body}`);
}

// ---------- Заголовки разделов ----------
function section(title) {
  const W = 900, H = 56, tw = title.length * 23 + 50;
  const l = 450 - tw / 2, r = 450 + tw / 2;
  const diamond = (x) => `<path d="M${x} 20 L${x + 6} 28 L${x} 36 L${x - 6} 28 Z" fill="${C.lilac}"/>`;
  return svg(W, H, `
  <defs>
    <linearGradient id="ll" x1="0" x2="1"><stop offset="0" stop-color="${C.purple}" stop-opacity="0"/><stop offset="1" stop-color="${C.lilac}"/></linearGradient>
    <linearGradient id="lr" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></linearGradient>
    <linearGradient id="tx" x1="0" x2="1"><stop offset="0" stop-color="${C.pale}"/><stop offset=".5" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.bright}"/></linearGradient>
  </defs>
  <rect x="120" y="27" width="${l - 140}" height="2" fill="url(#ll)"/>
  <rect x="${r + 20}" y="27" width="${780 - r - 20}" height="2" fill="url(#lr)"/>
  ${diamond(l - 8)}${diamond(r + 8)}
  <text x="450" y="37" text-anchor="middle" font-family="${SANS}" font-size="26" font-weight="700" fill="url(#tx)" letter-spacing="3">${esc(title.toUpperCase())}</text>`);
}

// ---------- «Обо мне» в виде окна редактора ----------
function about() {
  const W = 900, H = 290;
  const k = (s) => `<tspan fill="#f472b6">${esc(s)}</tspan>`;
  const p = (s) => `<tspan fill="${C.muted}">${esc(s)}</tspan>`;
  const s = (x) => `<tspan fill="#86efac">${esc(x)}</tspan>`;
  const v = (x) => `<tspan fill="${C.lilac}">${esc(x)}</tspan>`;
  const code = [
    `${k("const")} ${v("sixl")} ${p("=")} ${p("{")}`,
    `  ${v("role")}${p(":")}      ${s('"game developer"')}${p(",")}`,
    `  ${v("engines")}${p(":")}   ${p("[")}${s('"Godot 4"')}${p(", ")}${s('"HTML5 Canvas"')}${p(", ")}${s('"Capacitor"')}${p("],")}`,
    `  ${v("languages")}${p(":")} ${p("[")}${s('"GDScript"')}${p(", ")}${s('"JavaScript"')}${p(", ")}${s('"Python"')}${p("],")}`,
    `  ${v("focus")}${p(":")}     ${s('"офлайн-игры, процедурная генерация, баланс"')}${p(",")}`,
    `  ${v("motto")}${p(":")}     ${s('"копай глубже"')}${p(",")}`,
    `${p("};")}`,
  ];
  const text = code
    .map((l, i) => `<text x="70" y="${96 + i * 26}" font-family="${MONO}" font-size="16" fill="${C.pale}" xml:space="preserve">${l}</text>
    <text x="40" y="${96 + i * 26}" font-family="${MONO}" font-size="14" fill="#4c3a78" text-anchor="end">${i + 1}</text>`)
    .join("");
  return svg(W, H, `
  ${cardFrame(W, H, "ab")}
  <path d="M2 50 H${W - 2}" stroke="${C.deep}" stroke-width="1.5"/>
  <circle cx="30" cy="26" r="7" fill="${C.lilac}"/><circle cx="54" cy="26" r="7" fill="${C.bright}"/><circle cx="78" cy="26" r="7" fill="${C.violet}"/>
  <text x="450" y="31" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${C.muted}">about-me.js</text>
  ${text}
  <rect x="${70 + 16 * 0.6 * 28}" y="${96 + 5 * 26 - 15}" width="9" height="19" fill="${C.lilac}"><animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>`);
}

// ---------- Карточки проектов ----------
function wrap(text, max) {
  const out = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}
function project({ file, title, sub, desc, tags, icon }) {
  const W = 440, H = 230;
  const lines = wrap(desc, 50)
    .map((l, i) => `<text x="28" y="${104 + i * 21}" font-family="${SANS}" font-size="14" fill="${C.pale}">${esc(l)}</text>`)
    .join("");
  let x = 28;
  const pills = tags.map((t) => {
    const w = t.length * 7.4 + 22;
    const s = `<rect x="${x}" y="186" width="${w}" height="24" rx="12" fill="${C.deep}" stroke="${C.purple}"/>
    <text x="${x + w / 2}" y="202" text-anchor="middle" font-family="${SANS}" font-size="12" font-weight="600" fill="${C.lilac}">${esc(t)}</text>`;
    x += w + 8;
    return s;
  }).join("");
  save(file, svg(W, H, `
  ${cardFrame(W, H, "pc")}
  <defs><linearGradient id="ic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient></defs>
  <rect x="28" y="26" width="44" height="44" rx="12" fill="url(#ic)"/>
  <g transform="translate(50 48)" stroke="${C.white}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none">${icon}</g>
  <text x="86" y="46" font-family="${SANS}" font-size="22" font-weight="700" fill="${C.white}">${esc(title)}</text>
  <text x="86" y="66" font-family="${SANS}" font-size="13" fill="${C.muted}">${esc(sub)}</text>
  <text x="${W - 28}" y="46" text-anchor="end" font-family="${SANS}" font-size="20" fill="${C.lilac}">↗</text>
  ${lines}
  ${pills}`));
}

// ---------- Музыка: эквалайзер и пластинка ----------
function music() {
  const W = 900, H = 200, base = 168;
  let bars = "";
  for (let i = 0; i < 38; i++) {
    const x = 48 + i * 16, hs = Array.from({ length: 6 }, () => Math.round(16 + rnd() * 116));
    const vals = [...hs, hs[0]].map((h) => `${base - h}`).join(";");
    const hv = [...hs, hs[0]].join(";");
    const dur = (0.9 + rnd() * 0.9).toFixed(2);
    bars += `<rect x="${x}" y="${base - hs[0]}" width="11" height="${hs[0]}" rx="3" fill="url(#eq)">
      <animate attributeName="y" values="${vals}" dur="${dur}s" repeatCount="indefinite"/>
      <animate attributeName="height" values="${hv}" dur="${dur}s" repeatCount="indefinite"/></rect>`;
  }
  let grooves = "";
  for (let r = 30; r <= 66; r += 6) grooves += `<circle r="${r}" stroke="#2a1454" stroke-width="1.2"/>`;
  return svg(W, H, `
  ${cardFrame(W, H, "vb")}
  <defs>
    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.pale}"/><stop offset=".5" stop-color="${C.bright}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
    <radialGradient id="lbl"><stop offset="0" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.purple}"/></radialGradient>
  </defs>
  <rect x="44" y="${base + 2}" width="612" height="2" rx="1" fill="${C.deep}"/>
  ${bars}
  <g transform="translate(772 100)">
    <circle r="70" fill="#0a0118" stroke="${C.purple}" stroke-width="2"/>
    <g>
      ${grooves}
      <path d="M0 -68 A68 68 0 0 1 48 -48 L0 0 Z" fill="${C.lilac}" opacity=".08"/>
      <circle r="22" fill="url(#lbl)"/>
      <text y="4" text-anchor="middle" font-family="${MONO}" font-size="9" font-weight="700" fill="${C.bg}">6ixl</text>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/>
    </g>
    <circle r="3" fill="${C.bg}"/>
    <path d="M78 -62 L60 -10 L34 14" stroke="${C.pale}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="78" cy="-62" r="7" fill="${C.purple}" stroke="${C.pale}" stroke-width="2"/>
  </g>`);
}

// ---------- Подвал ----------
function footer() {
  const W = 1200, H = 150;
  const layer = (base, amp, phase, color, op, dur) =>
    `<path d="${wave(W, base, amp, phase)} L${W * 2} ${H} L0 ${H} Z" fill="${color}" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="-${W} 0" dur="${dur}s" repeatCount="indefinite"/></path>`;
  return svg(W, H, `
  <defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.lilac}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="#2e1065"/></linearGradient></defs>
  ${layer(50, 12, 0, "url(#fg)", 0.35, 14)}
  ${layer(70, 14, 2, "url(#fg)", 0.6, 10)}
  ${layer(90, 10, 4, "url(#fg)", 1, 18)}
  <text x="600" y="130" text-anchor="middle" font-family="${SANS}" font-size="18" font-weight="600" fill="${C.white}" letter-spacing="2">спасибо, что заглянул  ♥</text>`);
}

// ---------- Статистика ----------
const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositories(ownerAffiliations: OWNER, first: 100, privacy: PUBLIC) {
      totalCount
      nodes { isFork stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } } }
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

function statsCard(u) {
  const W = 440, H = 210;
  const repos = u.repositories.nodes;
  const stars = repos.reduce((a, r) => a + r.stargazerCount, 0);
  const cc = u.contributionsCollection;
  const rows = [
    ["Звёзды", stars],
    ["Коммиты за год", cc.totalCommitContributions + cc.restrictedContributionsCount],
    ["Pull requests", u.pullRequests.totalCount],
    ["Issues", u.issues.totalCount],
    ["Репозитории", u.repositories.totalCount],
    ["Подписчики", u.followers.totalCount],
  ];
  const total = cc.contributionCalendar.totalContributions;
  const R = 50, L = 2 * Math.PI * R, fill = Math.min(1, total / 1000);
  const body = rows.map(([k, v], i) => `
    <circle cx="34" cy="${72 + i * 22}" r="4" fill="${[C.lilac, C.bright, C.purple][i % 3]}"/>
    <text x="48" y="${77 + i * 22}" font-family="${SANS}" font-size="14" fill="${C.pale}">${k}</text>
    <text x="260" y="${77 + i * 22}" text-anchor="end" font-family="${SANS}" font-size="14" font-weight="700" fill="${C.white}">${fmt(v)}</text>`).join("");
  return svg(W, H, `
  ${cardFrame(W, H, "st")}
  <text x="28" y="40" font-family="${SANS}" font-size="18" font-weight="700" fill="${C.lilac}">Статистика GitHub</text>
  ${body}
  <g transform="translate(350 118)">
    <circle r="${R}" stroke="${C.deep}" stroke-width="10"/>
    <circle r="${R}" stroke="url(#stb)" stroke-width="10" stroke-linecap="round" transform="rotate(-90)"
      stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${L.toFixed(1)}">
      <animate attributeName="stroke-dashoffset" from="${L.toFixed(1)}" to="${(L * (1 - Math.max(fill, 0.04))).toFixed(1)}" dur="1.6s" fill="freeze"/>
    </circle>
    <text y="6" text-anchor="middle" font-family="${SANS}" font-size="26" font-weight="800" fill="${C.white}">${fmt(total)}</text>
    <text y="26" text-anchor="middle" font-family="${SANS}" font-size="11" fill="${C.muted}">вклад за год</text>
  </g>`);
}

function langsCard(u) {
  const W = 440, H = 210;
  const sizes = {};
  for (const r of u.repositories.nodes) {
    if (r.isFork) continue;
    for (const e of r.languages.edges) sizes[e.node.name] = (sizes[e.node.name] || 0) + e.size;
  }
  const sum = Object.values(sizes).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const shades = [C.lilac, C.bright, C.purple, C.violet, "#d8b4fe", "#6d28d9"];
  let x = 28, bar = "";
  top.forEach(([, s], i) => {
    const w = (s / sum) * 384;
    bar += `<rect x="${x.toFixed(1)}" y="58" width="${w.toFixed(1)}" height="12" fill="${shades[i]}"/>`;
    x += w;
  });
  const list = top.map(([n, s], i) => {
    const cx = 28 + (i % 2) * 200, cy = 102 + Math.floor(i / 2) * 32;
    return `<circle cx="${cx + 6}" cy="${cy - 5}" r="6" fill="${shades[i]}"/>
    <text x="${cx + 20}" y="${cy}" font-family="${SANS}" font-size="14" fill="${C.pale}">${esc(n)}</text>
    <text x="${cx + 180}" y="${cy}" text-anchor="end" font-family="${SANS}" font-size="13" font-weight="700" fill="${C.muted}">${((s / sum) * 100).toFixed(1)}%</text>`;
  }).join("");
  return svg(W, H, `
  ${cardFrame(W, H, "lg")}
  <clipPath id="bar"><rect x="28" y="58" width="384" height="12" rx="6"/></clipPath>
  <text x="28" y="40" font-family="${SANS}" font-size="18" font-weight="700" fill="${C.lilac}">Языки</text>
  <rect x="28" y="58" width="384" height="12" rx="6" fill="${C.deep}"/>
  <g clip-path="url(#bar)">${bar}</g>
  ${list || `<text x="28" y="110" font-family="${SANS}" font-size="14" fill="${C.muted}">пока нет данных</text>`}`);
}

function streakCard(days) {
  const W = 900, H = 170;
  const today = new Date().toISOString().slice(0, 10);
  let longest = 0, run = 0, total = 0;
  for (const d of days) {
    total += d.contributionCount;
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let i = days.length - 1, current = 0;
  if (i >= 0 && days[i].date === today && days[i].contributionCount === 0) i--;
  for (; i >= 0 && days[i].contributionCount > 0; i--) current++;
  const col = (x, value, label) => `
    <text x="${x}" y="92" text-anchor="middle" font-family="${SANS}" font-size="34" font-weight="800" fill="${C.white}">${value}</text>
    <text x="${x}" y="124" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="600" fill="${C.lilac}">${label}</text>`;
  return svg(W, H, `
  ${cardFrame(W, H, "sk")}
  <defs><linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.pale}"/></linearGradient></defs>
  ${col(160, fmt(total), "вклад за год")}
  <path d="M300 40 V130 M600 40 V130" stroke="${C.deep}" stroke-width="2"/>
  <circle cx="450" cy="84" r="48" stroke="${C.purple}" stroke-width="6"/>
  <path d="M450 18 C462 30 466 38 458 46 C466 44 470 38 470 34 C478 44 474 58 450 62 C426 58 424 42 438 30 C438 38 442 42 446 42 C440 34 442 26 450 18 Z" fill="url(#fl)" transform="translate(450 60) scale(.42) translate(-451 -40)"/>
  <text x="450" y="104" text-anchor="middle" font-family="${SANS}" font-size="30" font-weight="800" fill="${C.white}">${current}</text>
  <text x="450" y="152" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="600" fill="${C.lilac}">текущая серия, дней</text>
  ${col(740, longest, "лучшая серия, дней")}`);
}

function heatmap(weeks) {
  const cell = 12, gap = 3, top = 62, left = Math.round((900 - weeks.length * 15) / 2) + 12;
  const W = 900, H = 230;
  const levels = ["#1b0b3a", C.deep, C.violet, C.bright, C.pale];
  const max = Math.max(1, ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)));
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  let cells = "", labels = "", lastMonth = -1;
  weeks.forEach((w, wi) => {
    const x = left + wi * (cell + gap);
    w.contributionDays.forEach((d) => {
      const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
      const lvl = d.contributionCount === 0 ? 0 : Math.min(4, Math.ceil((d.contributionCount / max) * 4));
      cells += `<rect x="${x}" y="${top + dow * (cell + gap)}" width="${cell}" height="${cell}" rx="3" fill="${levels[lvl]}"><title>${d.date}: ${d.contributionCount}</title></rect>`;
    });
    const m = new Date(w.contributionDays[0].date + "T00:00:00Z").getUTCMonth();
    if (m !== lastMonth && wi > 0 && wi < weeks.length - 2) {
      labels += `<text x="${x}" y="${top - 10}" font-family="${SANS}" font-size="12" fill="${C.muted}">${months[m]}</text>`;
      lastMonth = m;
    }
  });
  const days = ["", "пн", "", "ср", "", "пт", ""]
    .map((d, i) => d && `<text x="${left - 10}" y="${top + i * (cell + gap) + 11}" text-anchor="end" font-family="${SANS}" font-size="11" fill="${C.muted}">${d}</text>`)
    .join("");
  const legend = levels.map((c, i) => `<rect x="${W - 150 + i * 17}" y="${H - 30}" width="13" height="13" rx="3" fill="${c}"/>`).join("");
  return svg(W, H, `
  ${cardFrame(W, H, "hm")}
  <text x="28" y="34" font-family="${SANS}" font-size="18" font-weight="700" fill="${C.lilac}">Активность за год</text>
  ${labels}${days}${cells}
  <text x="${W - 160}" y="${H - 19}" text-anchor="end" font-family="${SANS}" font-size="11" fill="${C.muted}">меньше</text>
  ${legend}
  <text x="${W - 60}" y="${H - 19}" font-family="${SANS}" font-size="11" fill="${C.muted}">больше</text>`);
}

// ---------- Запуск ----------
save("header.svg", header());
save("typing.svg", typing());
save("about.svg", about());
save("music.svg", music());
save("footer.svg", footer());
for (const [f, t] of [["sec-about", "обо мне"], ["sec-stack", "стек"], ["sec-projects", "проекты"], ["sec-stats", "статистика"]]) {
  save(`${f}.svg`, section(t));
}
project({
  file: "project-yudcore.svg",
  title: "YudCore",
  sub: "2D-копалка · Godot 4",
  desc: "Прокопайся до ядра Земли (5000 м), затем лети на Луну, Марс, Европу, Титан и Венеру. Биомы, вода и лава, плавильня, сплавы, перерождения и древо прокачки.",
  tags: ["Godot 4.7", "GDScript", "Windows", "Web"],
  icon: `<path d="M-11 -6 Q0 -16 11 -6"/><path d="M0 -11 L0 12"/>`,
});
project({
  file: "project-chmogame.svg",
  title: "Чмога",
  sub: "375 мини-игр · Android",
  desc: "Офлайн-сборник мини-игр: слова, головоломки, аркады, настольные и карточные. Процедурные уровни, общие монеты, игра по Wi-Fi и автообновление.",
  tags: ["JavaScript", "Capacitor", "Android"],
  icon: `<rect x="-12" y="-7" width="24" height="14" rx="6"/><path d="M-6 -2 V2 M-8 0 H-4"/><circle cx="5" cy="-1" r="1" fill="#fff"/><circle cx="8" cy="2" r="1" fill="#fff"/>`,
});

if (TOKEN) {
  const u = await fetchStats();
  const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  save("stats.svg", statsCard(u));
  save("langs.svg", langsCard(u));
  save("streak.svg", streakCard(days));
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
    followers: { totalCount: 1 }, pullRequests: { totalCount: 4 }, issues: { totalCount: 2 },
    repositories: { totalCount: 3, nodes: [
      { isFork: false, stargazerCount: 2, languages: { edges: [{ size: 900000, node: { name: "JavaScript" } }, { size: 80000, node: { name: "Python" } }, { size: 20000, node: { name: "HTML" } }] } },
      { isFork: false, stargazerCount: 1, languages: { edges: [{ size: 700000, node: { name: "GDScript" } }, { size: 30000, node: { name: "Python" } }] } },
    ] },
    contributionsCollection: { totalCommitContributions: 512, restrictedContributionsCount: 0, contributionCalendar: { totalContributions: 734, weeks } },
  };
  save("stats.svg", statsCard(u));
  save("langs.svg", langsCard(u));
  save("streak.svg", streakCard(weeks.flatMap((w) => w.contributionDays)));
  save("activity.svg", heatmap(weeks));
}
