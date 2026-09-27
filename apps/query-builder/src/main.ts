import { MorphicBlocks } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import { columns, planets, type Planet } from "./planets";
import program from "./program.json";
import "./style.css";

const byId = (id: string) => document.getElementById(id)!;

const engine = new MorphicBlocks(definitions, behaviors);

const presetButtons = document.querySelectorAll<HTMLButtonElement>("[data-preset]");

engine.mount({
  // The toolbox is mounted below, so Blockly builds none itself.
  canvasToolbox: true,
  workspaceContainer: byId("workspace"),
  codespaceContainer: byId("sql"),
  // The generated JavaScript, shown in the second tab. It starts hidden.
  codeEditorContainer: byId("js"),
  modesFolder: import.meta.glob("./modes/*.css", { eager: true, query: "?inline" }),
  // Code views are dark by default; these colors suit the paper grey page.
  editorTheme: {
    background: "#fcfcfa",
    foreground: "#1b1d21",
    gutterBackground: "#f1f2ee",
    gutterForeground: "#9a9f97",
    selectionBackground: "#fbdcc6",
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: "14px",
    lineHeight: 1.6,
  },
  onPresetApplied: (preset) => {
    for (const button of presetButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.preset === preset.name));
    }
  },
  blockly: {
    // Blockly's images and sounds come from the app (scripts/copy-blockly-media.mjs).
    media: "blockly-media/",
    trashcan: true,
    grid: { spacing: 24, length: 24, colour: "#e6e8e2", snap: true },
    zoom: { controls: true, startScale: 0.95 },
  },
});

// Mounted on its own because only this call can leave out the "Mode:" label;
// mount() always shows it.
engine.mountToolbox(byId("toolbox"), { modeLabel: false });

engine.loadWorkspace(program);
// Blockly centers the program; start at the top left corner instead.
engine.getWorkspace()?.scroll(0, 0);

for (const button of presetButtons) {
  button.addEventListener("click", () => engine.applyPreset(button.dataset.preset!));
}

// Tabs: the SQL view and the JavaScript view share one pane.
const tabSql = byId("tab-sql");
const tabJs = byId("tab-js");
// The notice under the tabs explains whichever view is open.
const notice = document.querySelector<HTMLElement>(".notice")!;
const noticeHtml = {
  sql: notice.innerHTML,
  js: "<strong>This is what runs.</strong> The same blocks write it when you press Run, so it means what the SQL editor shows.",
};
function showTab(js: boolean) {
  notice.innerHTML = js ? noticeHtml.js : noticeHtml.sql;
  tabSql.setAttribute("aria-selected", String(!js));
  tabJs.setAttribute("aria-selected", String(js));
  byId("sql").hidden = js;
  if (js) engine.showCodeEditor();
  else engine.hideCodeEditor();
}
tabSql.addEventListener("click", () => showTab(false));
tabJs.addEventListener("click", () => showTab(true));

// The table's columns, listed like a database tool lists a schema.
byId("row-count").textContent = `${planets.length} rows`;
byId("schema").innerHTML = columns
  .map((c) => `<li><span class="col">${c.name}</span><span class="kind">${c.kind === "text" ? "TEXT" : "NUMBER"}</span></li>`)
  .join("");

interface Result {
  columns: (keyof Planet)[];
  rows: Planet[];
}

// Loose blocks outside a query read these stand ins: no rows and an empty
// row. So they change nothing, the way a loose clause means nothing in SQL.
const standIns = `let rows = [];\nconst row = { name: "", type: "", moons: 0, diameter: 0, distance: 0 };\n`;

// The code of the last run, to tell when the blocks mean something new.
let lastRun = "";

// Runs the generated JavaScript with the table handed in.
function run() {
  const code = engine.generateJavaScript();
  lastRun = code;
  const results: Result[] = [];
  const started = performance.now();
  try {
    new Function("planets", "results", standIns + code)(planets, results);
  } catch (error) {
    showStatus(`Error: ${(error as Error).message}`, true);
    byId("results").replaceChildren();
    return;
  }
  const ms = performance.now() - started;
  renderResults(results);
  if (results.length === 0) {
    showStatus("No query yet: drag a Query block into the builder.", true);
  } else {
    const rows = results.reduce((sum, r) => sum + r.rows.length, 0);
    showStatus(`${rows} ${rows === 1 ? "row" : "rows"} in ${ms < 0.1 ? "under 0.1" : ms.toFixed(1)} ms`, false);
  }
}

function showStatus(text: string, warn: boolean) {
  const status = byId("status");
  status.textContent = text;
  status.classList.toggle("warn", warn);
  status.classList.remove("stale");
}

const numberFormat = new Intl.NumberFormat("en");

function renderResults(results: Result[]) {
  byId("results").innerHTML = results
    .map((result, index) => tableHtml(result, results.length > 1 ? `Query ${index + 1}` : ""))
    .join("");
}

function tableHtml(result: Result, captionText = "") {
  const numeric = (col: string) => columns.some((c) => c.name === col && c.kind === "number");
  const head = result.columns
    .map((col) => `<th class="${numeric(col) ? "num" : ""}">${col}</th>`)
    .join("");
  const body = result.rows.length
    ? result.rows
        .map((row, i) => {
          const cells = result.columns
            .map((col) => {
              const value = row[col];
              return typeof value === "number"
                ? `<td class="num">${numberFormat.format(value)}</td>`
                : `<td>${escapeHtml(String(value))}</td>`;
            })
            .join("");
          return `<tr><th class="rownum">${i + 1}</th>${cells}</tr>`;
        })
        .join("")
    : `<tr><td class="empty" colspan="${result.columns.length + 1}">No row matches.</td></tr>`;
  const caption = captionText ? `<caption>${captionText}</caption>` : "";
  return `<table>${caption}<thead><tr><th class="rownum"></th>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

// The whole table next to the results, so a query can be checked against it.
byId("table").innerHTML = tableHtml({ columns: columns.map((c) => c.name), rows: [...planets] });

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

byId("run").addEventListener("click", run);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    run();
  }
});

// Once the blocks mean something new, the table shown no longer matches.
engine.getWorkspace()?.addChangeListener((event) => {
  if (event.isUiEvent) return;
  const status = byId("status");
  if (!status.classList.contains("stale") && engine.generateJavaScript() !== lastRun) {
    status.textContent = "Blocks changed: run the query again";
    status.classList.add("stale");
    status.classList.remove("warn");
  }
});

run();
