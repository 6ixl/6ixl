// Генерирует все SVG профиля в assets/.
// Стиль: минимализм, глубокий космос, фиолетовый. Все анимации — SMIL, они работают в README на GitHub.
// Без GITHUB_TOKEN рисует только статичные картинки (hero, focus, подвал);
// с токеном (в GitHub Actions) ещё и панель статистики по данным GraphQL API.
// DEMO=1 — статистика на выдуманных данных для локального предпросмотра.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const USER = process.env.GH_USER || "6ixl";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

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

// Иконка YudUi встраивается прямо в SVG: внешние картинки в README-SVG не грузятся.
const ICON = "data:image/jpeg;base64," + readFileSync(new URL("yudui-icon.jpg", OUT)).toString("base64");

const lbl = (x, y, t, fill = C.muted, anchor = "start", size = 11) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}" fill="${fill}" letter-spacing="2.5">${esc(t)}</text>`;

// Неоновая иконка YudUi со скруглёнными углами и пульсирующим свечением.
function icon(x, y, s, id) {
  const r = s * 0.22;
  return `
  <defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}"/></clipPath></defs>
  <rect x="${x - s * 0.1}" y="${y - s * 0.1}" width="${s * 1.2}" height="${s * 1.2}" rx="${r * 1.4}" fill="url(#iglow)">
    <animate attributeName="opacity" values=".55;1;.55" dur="3.2s" repeatCount="indefinite"/>
  </rect>
  <image href="${ICON}" x="${x}" y="${y}" width="${s}" height="${s}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" stroke="${C.lilac}" stroke-opacity=".7" stroke-width="${Math.max(1, s / 90)}"/>`;
}
const iglowDef = `<radialGradient id="iglow"><stop offset=".55" stop-color="${C.bright}" stop-opacity=".55"/><stop offset="1" stop-color="${C.bright}" stop-opacity="0"/></radialGradient>`;

// Маленькая планета с кольцом.
function planet(px, py, r, id) {
  return `
  <defs>
    <radialGradient id="${id}p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${C.pale}"/><stop offset=".35" stop-color="${C.bright}"/><stop offset=".8" stop-color="${C.deep}"/><stop offset="1" stop-color="#14052e"/></radialGradient>
    <linearGradient id="${id}r" x1="0" x2="1"><stop offset="0" stop-color="${C.lilac}" stop-opacity="0"/><stop offset=".5" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.lilac}" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}f"><rect x="${px - r * 4}" y="${py}" width="${r * 8}" height="${r * 4}"/></clipPath>
  </defs>
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="7s" repeatCount="indefinite"/>
    <ellipse cx="${px}" cy="${py}" rx="${r * 2.3}" ry="${r * 0.45}" stroke="url(#${id}r)" stroke-width="1.2" opacity=".5" transform="rotate(-16 ${px} ${py})"/>
    <circle cx="${px}" cy="${py}" r="${r}" fill="url(#${id}p)"/>
    <g clip-path="url(#${id}f)" transform="rotate(-16 ${px} ${py})"><ellipse cx="${px}" cy="${py}" rx="${r * 2.3}" ry="${r * 0.45}" stroke="url(#${id}r)" stroke-width="1.6"/></g>
  </g>`;
}

// ---------- Hero ----------
function hero() {
  const W = 1200, H = 400;
  const cx = 980, cy = 206; // центр панели с иконкой
  return svg(W, H, `
  <defs>
    <radialGradient id="n1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(900 40) scale(560 340)">
      <stop offset="0" stop-color="${C.purple}" stop-opacity=".45"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="n2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 400) scale(520 260)">
      <stop offset="0" stop-color="#4338ca" stop-opacity=".28"/><stop offset="1" stop-color="#4338ca" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="name" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="330" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.white}"/><stop offset=".4" stop-color="${C.pale}"/><stop offset=".5" stop-color="${C.bright}"/><stop offset=".6" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.white}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-300 0;300 0" dur="5s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="pb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.lilac}"/><stop offset=".35" stop-color="${C.purple}" stop-opacity=".15"/><stop offset=".65" stop-color="${C.purple}" stop-opacity=".15"/><stop offset="1" stop-color="${C.lilac}"/>
      <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
    <clipPath id="hf"><rect width="${W}" height="${H}" rx="22"/></clipPath>
    ${iglowDef}${cometDef}
  </defs>
  <g clip-path="url(#hf)">
    <rect width="${W}" height="${H}" fill="${C.space}"/>
    <rect width="${W}" height="${H}" fill="url(#n1)"><animate attributeName="opacity" values=".75;1;.75" dur="9s" repeatCount="indefinite"/></rect>
    <rect width="${W}" height="${H}" fill="url(#n2)"/>
    ${stars(120, 0, 0, W, H)}
    ${sparkle(560, 110, 6, 4, 0)}${sparkle(1170, 360, 5, 5, 2)}${sparkle(760, 300, 4, 6, 3)}
    ${comet(700, 40, 110, 8, 1.5)}${comet(420, 70, 80, 11, 6)}
    <ellipse cx="${cx}" cy="${cy}" rx="330" ry="120" stroke="${C.lilac}" stroke-opacity=".18" transform="rotate(-12 ${cx} ${cy})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="420" ry="170" stroke="${C.lilac}" stroke-opacity=".08" transform="rotate(-12 ${cx} ${cy})"/>
    <circle r="3.5" fill="${C.pale}">
      <animateMotion dur="16s" repeatCount="indefinite" path="M${cx - 322.8} ${cy + 68.6} A330 120 -12 1 1 ${cx + 322.8} ${cy - 68.6} A330 120 -12 1 1 ${cx - 322.8} ${cy + 68.6}"/>
    </circle>
    ${planet(690, 150, 16, "hp")}
  </g>

  ${lbl(48, 46, "6IXL / DEEP SPACE")}
  <circle cx="1110" cy="42" r="3.5" fill="${C.lilac}"/><circle cx="1128" cy="42" r="3.5" fill="${C.bright}"/><circle cx="1146" cy="42" r="3.5" fill="${C.violet}"/>
  <rect x="40" y="66" width="1120" height="1" fill="${C.line}"/>

  <text x="42" y="182" font-family="${SANS}" font-size="104" font-weight="700" fill="url(#name)" letter-spacing="-1">6ixl</text>
  <text x="48" y="224" font-family="${SANS}" font-size="24" fill="${C.pale}" opacity=".85">Games, interfaces &amp; tiny universes.</text>
  <rect x="48" y="248" width="196" height="38" rx="19" fill="${C.deep}" fill-opacity=".6" stroke="${C.purple}" stroke-opacity=".6"/>
  <circle cx="70" cy="267" r="9" fill="${C.bright}" opacity=".35"><animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="2s" repeatCount="indefinite"/></circle>
  <circle cx="70" cy="267" r="5" fill="${C.lilac}"/>
  ${lbl(86, 271, "BUILDING YUDUI", C.pale, "start", 11)}
  <text x="48" y="320" font-family="${SANS}" font-size="14" fill="${C.muted}">Pixels with gravity. Motion with purpose.</text>

  <rect x="40" y="346" width="1120" height="1" fill="${C.line}"/>
  ${lbl(48, 374, "BUILD / LAUNCH / REPEAT", C.muted, "start", 10)}
  ${lbl(1152, 374, "MADE OF STARDUST & LITTLE DETAILS", C.muted, "end", 10)}

  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="6s" repeatCount="indefinite"/>
    <rect x="${cx - 150}" y="${cy - 120}" width="300" height="250" rx="22" fill="${C.card}" fill-opacity=".75"/>
    <rect x="${cx - 150}" y="${cy - 120}" width="300" height="250" rx="22" stroke="url(#pb)" stroke-width="1.4"/>
    ${icon(cx - 82, cy - 100, 164, "hi")}
    <text x="${cx - 128}" y="${cy + 108}" font-family="${SANS}" font-size="16" font-weight="700" fill="${C.white}">YudUi</text>
    ${lbl(cx + 128, cy + 107, "DESKTOP / REIMAGINED", C.muted, "end", 9)}
  </g>`);
}

// ---------- Current focus + toolbox ----------
const TOOLS = [
  ["Go", "Go"], ["Wails", "W"], ["Svelte", "S"], ["TypeScript", "TS"],
  ["Godot", "G4"], ["GDScript", "gd"], ["JavaScript", "JS"], ["Python", "Py"],
];
function focus() {
  const W = 1200, H = 260, tx = 620, tw = 128, th = 50, tg = 10;
  const tiles = TOOLS.map(([name, glyph], i) => {
    const x = tx + (i % 4) * (tw + tg), y = 72 + Math.floor(i / 4) * (th + tg);
    const d = (i * 0.35).toFixed(2);
    return `
    <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12" fill="${C.space}" fill-opacity=".6" stroke="${C.line}"/>
    <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12" stroke="${C.lilac}" stroke-opacity="0">
      <animate attributeName="stroke-opacity" values="0;.8;0;0" keyTimes="0;.06;.16;1" dur="5.6s" begin="${d}s" repeatCount="indefinite"/>
    </rect>
    <rect x="${x + 12}" y="${y + 12}" width="26" height="26" rx="7" stroke="${C.lilac}" stroke-opacity=".7"/>
    <text x="${x + 25}" y="${y + 29}" text-anchor="middle" font-family="${MONO}" font-size="10" font-weight="700" fill="${C.lilac}">${glyph}</text>
    <text x="${x + 48}" y="${y + 30}" font-family="${SANS}" font-size="14" font-weight="600" fill="${C.pale}">${name}</text>`;
  }).join("");
  return svg(W, H, `
  ${frame(W, H, "fo")}
  <defs>
    <radialGradient id="fog" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(520 260) scale(420 200)">
      <stop offset="0" stop-color="${C.purple}" stop-opacity=".3"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </radialGradient>
    ${iglowDef}
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#fog)"/>
  <g clip-path="url(#foc)">${stars(30, 10, 10, W - 20, H - 20, 1)}</g>
  ${lbl(40, 48, "CURRENT FOCUS")}
  ${icon(40, 72, 46, "fi")}
  <text x="102" y="108" font-family="${SANS}" font-size="34" font-weight="700" fill="${C.white}">YudUi</text>
  <text x="40" y="154" font-family="${SANS}" font-size="18" fill="${C.pale}">Windows 11, reimagined.</text>
  <text x="40" y="182" font-family="${SANS}" font-size="12" fill="${C.muted}">co-author · desktop customization · motion</text>
  <rect x="40" y="204" width="500" height="1" fill="${C.line}"/>
  <path d="M44 226 l4 -4 l4 4 l-4 4 Z" fill="${C.lilac}"/>
  <text x="60" y="230" font-family="${SANS}" font-size="13" fill="${C.pale}">YudCore</text>
  <text x="120" y="230" font-family="${SANS}" font-size="13" fill="${C.muted}">— a game about digging to the core.</text>
  ${lbl(tx, 48, "TOOLBOX")}
  ${tiles}
  ${lbl(1160, 230, "YUDUI.DEV ↗", C.lilac, "end", 11)}`);
}

// ---------- Статистика ----------
const QUERY = `query($login: String!) {
  user(login: $login) {
    repositories(ownerAffiliations: OWNER, first: 100, privacy: PUBLIC) {
      totalCount
      nodes { isFork stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } } }
    }
    contributionsCollection {
      totalCommitContributions
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
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const day = (iso) => { const d = new Date(iso + "T00:00:00Z"); return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`; };

// Кольцо с числом: дуга дорисовывается, по орбите бегает точка.
function ring(cx, cy, value, label, frac, id) {
  const R = 64, L = 2 * Math.PI * R, off = (L * (1 - Math.max(0.04, Math.min(1, frac)))).toFixed(1);
  let ticks = "";
  for (let a = 0; a < 360; a += 6) ticks += `<path d="M${cx} ${cy - 50} V${cy - 46}" stroke="${C.line}" transform="rotate(${a} ${cx} ${cy})"/>`;
  return `
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.pale}"/><stop offset="1" stop-color="${C.purple}"/></linearGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${R + 22}" stroke="${C.line}" stroke-opacity=".6"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.space}" stroke="${C.line}" stroke-width="6"/>
  ${ticks}
  <circle cx="${cx}" cy="${cy}" r="${R}" stroke="url(#${id})" stroke-width="6" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"
    stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${off}">
    <animate attributeName="stroke-dashoffset" values="${L.toFixed(1)};${off}" dur="1.8s" fill="freeze"/>
  </circle>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="9s" repeatCount="indefinite"/>
    <circle cx="${cx}" cy="${cy - R - 22}" r="4" fill="${C.lilac}"/>
    <circle cx="${cx}" cy="${cy - R - 22}" r="9" fill="${C.lilac}" opacity=".2"/>
  </g>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-family="${SANS}" font-size="34" font-weight="600" fill="${C.white}">${value}</text>
  <text x="${cx}" y="${cy + 30}" text-anchor="middle" font-family="${MONO}" font-size="8" fill="${C.lilac}" letter-spacing="1.2">${label}</text>
  ${lbl(cx, cy + 118, "LAST YEAR", C.muted, "middle", 10)}`;
}

function mixer(u) {
  const W = 1200, H = 600;
  const cal = u.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const active = days.filter((d) => d.contributionCount > 0).length;
  let best = 0, run = 0;
  for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; best = Math.max(best, run); }
  const repos = u.repositories.nodes;
  const stars_ = repos.reduce((a, r) => a + r.stargazerCount, 0);

  // 28 последних дней столбиками.
  const last = days.slice(-28), mx = Math.max(1, ...last.map((d) => d.contributionCount));
  const px = 330, py = 96, pw = 540, ph = 220, bw = 12, bg = (pw - 60 - 28 * bw) / 27;
  let bars = "";
  last.forEach((d, i) => {
    const x = px + 30 + i * (bw + bg), base = py + 176;
    const h = d.contributionCount ? Math.max(8, (d.contributionCount / mx) * 120) : 0;
    bars += `<rect x="${x.toFixed(1)}" y="${base - 120}" width="${bw}" height="120" rx="3" fill="${C.line}" opacity=".45"/>`;
    if (h) bars += `
    <rect x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="3" fill="url(#bar)">
      <animate attributeName="height" values="0;${h.toFixed(1)}" dur="1.2s" fill="freeze"/>
      <animate attributeName="y" values="${base};${(base - h).toFixed(1)}" dur="1.2s" fill="freeze"/>
      <animate attributeName="opacity" values="1;.65;1" dur="2.4s" begin="${(i * 0.08).toFixed(2)}s" repeatCount="indefinite"/>
    </rect>`;
  });

  const tiles = [
    [u.repositories.totalCount, "PUBLIC REPOS", "owned by this account"],
    [stars_, "STARS", "across public repos"],
    [fmt(u.contributionsCollection.totalCommitContributions), "COMMITS", "last year"],
    [best, "BEST STREAK", "days in a row"],
  ].map(([v, k, s], i) => {
    const x = 40 + i * 285;
    return `
    <rect x="${x}" y="356" width="265" height="84" rx="14" fill="${C.space}" fill-opacity=".55" stroke="${C.line}"/>
    <text x="${x + 18}" y="392" font-family="${SANS}" font-size="24" font-weight="600" fill="${C.white}">${v}</text>
    ${lbl(x + 18, 414, k, C.lilac, "start", 9)}
    <text x="${x + 18}" y="430" font-family="${SANS}" font-size="10" fill="${C.muted}">${s}</text>`;
  }).join("");

  // Языки по объёму кода в публичных репозиториях.
  const sizes = {};
  for (const r of repos) {
    if (r.isFork) continue;
    for (const e of r.languages.edges) sizes[e.node.name] = (sizes[e.node.name] || 0) + e.size;
  }
  const sum = Object.values(sizes).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const shades = [C.bright, "#f472b6", "#818cf8", C.pale, "#e879f9", C.violet];
  let x = 40, seg = "", legend = "";
  top.forEach(([n, s], i) => {
    const w = (s / sum) * 1120;
    seg += `<rect x="${x.toFixed(1)}" y="486" width="${w.toFixed(1)}" height="6" fill="${shades[i]}"/>`;
    x += w;
    const lx = 40 + (i % 3) * 380, ly = 518 + Math.floor(i / 3) * 24;
    const pct = (s / sum) * 100;
    legend += `<circle cx="${lx + 4}" cy="${ly - 4}" r="4" fill="${shades[i]}"/>
    <text x="${lx + 16}" y="${ly}" font-family="${SANS}" font-size="12" fill="${C.pale}">${esc(n)} <tspan fill="${C.muted}">${pct < 0.1 ? "&lt;0.1" : pct.toFixed(1)}%</tspan></text>`;
  });

  const now = new Date();
  const sync = `SYNC ${day(now.toISOString().slice(0, 10))}, ${now.toISOString().slice(11, 16)} UTC`;

  return svg(W, H, `
  ${frame(W, H, "mx")}
  <defs>
    <linearGradient id="bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.lilac}"/></linearGradient>
    <radialGradient id="mxg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 200) scale(520 220)">
      <stop offset="0" stop-color="${C.purple}" stop-opacity=".18"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="segs"><rect x="40" y="486" width="1120" height="6" rx="3"/></clipPath>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#mxg)"/>
  <g clip-path="url(#mxc)">${stars(30, 10, 10, W - 20, H - 20, 1)}</g>
  ${lbl(40, 46, "GITHUB // ORBIT", C.white, "start", 12)}
  ${lbl(1160, 46, "PUBLIC DATA", C.lilac, "end", 10)}
  <rect x="40" y="64" width="1120" height="1" fill="${C.line}"/>

  ${ring(180, 200, fmt(cal.totalContributions), "CONTRIBUTIONS", cal.totalContributions / 500, "rg1")}
  ${ring(1020, 200, active, "ACTIVE DAYS", active / 365, "rg2")}

  <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="16" fill="${C.space}" fill-opacity=".55" stroke="${C.line}"/>
  ${lbl(px + 30, py + 34, "ACTIVITY / 28 DAYS", C.lilac, "start", 10)}
  ${bars}
  ${lbl(px + 30, py + 202, last.length ? day(last[0].date) : "", C.muted, "start", 9)}
  ${lbl(px + pw - 30, py + 202, last.length ? day(last[last.length - 1].date) : "", C.muted, "end", 9)}

  ${tiles}

  ${lbl(40, 472, "LANGUAGE MIX / PUBLIC CODE", C.lilac, "start", 10)}
  <rect x="40" y="486" width="1120" height="6" rx="3" fill="${C.line}"/>
  <g clip-path="url(#segs)">${seg}</g>
  ${legend}

  ${lbl(40, 582, sync, C.muted, "start", 9)}
  <text x="1160" y="582" text-anchor="end" font-family="${SANS}" font-size="10" fill="${C.muted}">updates every 6h</text>`);
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


// ---------- Запуск ----------
save("hero.svg", hero());
save("focus.svg", focus());
save("footer.svg", footer());

if (TOKEN) {
  save("stats.svg", mixer(await fetchStats()));
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
  const lang = (pairs) => ({ edges: pairs.map(([name, size]) => ({ size, node: { name } })) });
  save("stats.svg", mixer({
    repositories: { totalCount: 4, nodes: [
      { isFork: false, stargazerCount: 2, languages: lang([["JavaScript", 900000], ["HTML", 60000], ["Python", 80000]]) },
      { isFork: false, stargazerCount: 1, languages: lang([["GDScript", 700000], ["Python", 30000]]) },
      { isFork: false, stargazerCount: 0, languages: lang([["CSS", 40000], ["Shell", 3000]]) },
    ] },
    contributionsCollection: { totalCommitContributions: 512, contributionCalendar: { totalContributions: 734, weeks } },
  }));
}
