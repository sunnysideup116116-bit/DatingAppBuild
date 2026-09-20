const documents = [
  { file: "00-index.md", number: "00", label: "文件索引", group: "START HERE" },
  { file: "00.5-getting-started.md", number: "00.5", label: "開始閱讀與啟動前提", group: "START HERE" },
  { file: "01-overview.md", number: "01", label: "整體概觀與 C4 架構", group: "START HERE" },
  { file: "02-repository-structure.md", number: "02", label: "Repository 與模組導覽", group: "START HERE" },
  { file: "03-datingapp-architecture.md", number: "03", label: "DatingApp 前端架構", group: "PRODUCT & DOMAIN" },
  { file: "04-auth-profile.md", number: "04", label: "身分驗證與個人資料", group: "PRODUCT & DOMAIN" },
  { file: "05-ai-agent.md", number: "05", label: "阿月與 Agent", group: "PRODUCT & DOMAIN" },
  { file: "06-matchmaking.md", number: "06", label: "配對與關係建立", group: "PRODUCT & DOMAIN" },
  { file: "07-chat-risk.md", number: "07", label: "聊天與風險治理", group: "PRODUCT & DOMAIN" },
  { file: "08-voice.md", number: "08", label: "語音互動", group: "PRODUCT & DOMAIN" },
  { file: "09-memory-graph.md", number: "09", label: "記憶、摘要與圖譜", group: "PRODUCT & DOMAIN" },
  { file: "10-calendar-events.md", number: "10", label: "活動、約會與行事曆", group: "PRODUCT & DOMAIN" },
  { file: "11-social-media.md", number: "11", label: "社群、貼文與媒體", group: "PRODUCT & DOMAIN" },
  { file: "12-api-data-contracts.md", number: "12", label: "API 與資料契約", group: "ENGINEERING" },
  { file: "13-background-reliability.md", number: "13", label: "背景工作與可靠性", group: "ENGINEERING" },
  { file: "14-deployment.md", number: "14", label: "部署、啟動與環境", group: "ENGINEERING" },
  { file: "15-testing.md", number: "15", label: "測試與驗證", group: "ENGINEERING" },
  { file: "16-evidence-and-open-questions.md", number: "16", label: "證據、限制與待釐清事項", group: "ENGINEERING" },
];

const documentByFile = new Map(documents.map((document) => [document.file, document]));
const documentCache = new Map();
const docNav = document.getElementById("doc-nav");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarClose = document.getElementById("sidebar-close");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const readerMain = document.querySelector(".reader-main");
const loading = document.getElementById("loading");
const documentContent = document.getElementById("document-content");
const loadError = document.getElementById("load-error");
const loadErrorMessage = document.getElementById("load-error-message");
const retryLoad = document.getElementById("retry-load");
const breadcrumb = document.getElementById("breadcrumb");
const docPosition = document.getElementById("doc-position");
const previousDoc = document.getElementById("previous-doc");
const nextDoc = document.getElementById("next-doc");
let currentFile = documents[0].file;
let mermaidModulePromise;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function validDocument(file) {
  return documentByFile.has(file) ? file : documents[0].file;
}

function currentDocumentFromUrl() {
  const requested = new URLSearchParams(window.location.search).get("doc");
  return validDocument(requested || documents[0].file);
}

function setSidebarOpen(open) {
  document.body.classList.toggle("sidebar-open", open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
}

function renderNavigation() {
  const groups = [];
  for (const documentInfo of documents) {
    let group = groups.find((candidate) => candidate.label === documentInfo.group);
    if (!group) {
      group = { label: documentInfo.group, items: [] };
      groups.push(group);
    }
    group.items.push(documentInfo);
  }

  docNav.innerHTML = groups.map((group) => `
    <div class="nav-group">
      <p class="nav-label">${escapeHtml(group.label)}</p>
      ${group.items.map((documentInfo) => `
        <a href="?doc=${encodeURIComponent(documentInfo.file)}" data-doc="${escapeAttribute(documentInfo.file)}">
          <span class="doc-number">${escapeHtml(documentInfo.number)}</span>
          <span>${escapeHtml(documentInfo.label)}</span>
        </a>
      `).join("")}
    </div>
  `).join("");
}

function updateNavigation(file) {
  document.querySelectorAll(".doc-nav a[data-doc]").forEach((link) => {
    const active = link.dataset.doc === file;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function updateDocumentMeta(file) {
  const documentInfo = documentByFile.get(file);
  const index = documents.indexOf(documentInfo);
  breadcrumb.textContent = documentInfo.file;
  docPosition.textContent = `${String(index + 1).padStart(2, "0")} / ${String(documents.length).padStart(2, "0")}`;
  document.title = `${documentInfo.number}｜${documentInfo.label}｜系統文件`;

  const previous = documents[index - 1];
  const next = documents[index + 1];
  updatePaginationLink(previousDoc, previous);
  updatePaginationLink(nextDoc, next);
}

function updatePaginationLink(link, documentInfo) {
  if (!documentInfo) {
    link.hidden = true;
    link.removeAttribute("data-doc");
    return;
  }
  link.hidden = false;
  link.dataset.doc = documentInfo.file;
  link.href = `?doc=${encodeURIComponent(documentInfo.file)}`;
  link.querySelector("strong").textContent = `${documentInfo.number} · ${documentInfo.label}`;
}

function slugify(value, usedSlugs) {
  const base = value
    .replaceAll("`", "")
    .replaceAll("*", "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";
  const count = usedSlugs.get(base) || 0;
  usedSlugs.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function tableRow(line) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = tableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isBlockStart(lines, index) {
  const line = lines[index];
  return /^```/.test(line)
    || /^#{1,6}\s+/.test(line)
    || /^\s*[-*+]\s+/.test(line)
    || /^\s*\d+\.\s+/.test(line)
    || /^>\s?/.test(line)
    || /^---+\s*$/.test(line)
    || (line.trim().startsWith("|") && isTableSeparator(lines[index + 1] || ""));
}

function safeLink(rawUrl) {
  const [path, hash = ""] = rawUrl.split("#", 2);
  if (/\.md$/i.test(path)) {
    const file = path.split("/").pop();
    if (documentByFile.has(file)) {
      return { href: `?doc=${encodeURIComponent(file)}${hash ? `#${hash}` : ""}`, document: file };
    }
  }
  if (/^(https?:\/\/|mailto:)/i.test(rawUrl) || rawUrl.startsWith("#")) {
    return { href: rawUrl };
  }
  return null;
}

function renderInline(source) {
  const tokens = [];
  const token = (value) => {
    const marker = `@@MDTOKEN${tokens.length}@@`;
    tokens.push(value);
    return marker;
  };

  let working = source;
  working = working.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_match, label, rawUrl) => {
    const link = safeLink(rawUrl);
    const labelHtml = renderInline(label);
    if (link?.document) {
      return token(`<a href="${escapeAttribute(link.href)}" data-doc="${escapeAttribute(link.document)}">${labelHtml}</a>`);
    }
    if (link) return token(`<a href="${escapeAttribute(link.href)}" rel="noreferrer">${labelHtml}</a>`);
    return token(`<span class="source-reference" title="${escapeAttribute(rawUrl)}">${labelHtml}</span>`);
  });
  working = working.replace(/`([^`]+)`/g, (_match, value) => token(`<code>${escapeHtml(value)}</code>`));
  working = escapeHtml(working);
  working = working.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  working = working.replace(/__(.+?)__/g, "<strong>$1</strong>");
  working = working.replace(/~~(.+?)~~/g, "<del>$1</del>");
  working = working.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  return working.replace(/@@MDTOKEN(\d+)@@/g, (_match, index) => tokens[Number(index)]);
}

function renderTable(lines, start) {
  const header = tableRow(lines[start]);
  let index = start + 2;
  const rows = [];
  while (index < lines.length && lines[index].trim().startsWith("|")) {
    rows.push(tableRow(lines[index]));
    index += 1;
  }

  const headHtml = header.map((cell) => `<th scope="col">${renderInline(cell)}</th>`).join("");
  const bodyHtml = rows.map((row) => {
    const cells = header.map((_headerCell, cellIndex) => row[cellIndex] || "");
    return `<tr>${cells.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`;
  }).join("");
  return {
    html: `<div class="table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
    nextIndex: index,
  };
}

function renderMarkdown(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const usedSlugs = new Map();
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      const language = fence[1] || "text";
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const className = language === "mermaid" ? "code-block diagram-code" : "code-block";
      output.push(`<pre class="${className}" data-language="${escapeAttribute(language)}"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const level = heading[1].length;
      const text = /^TL;DR$/i.test(heading[2].trim()) ? "重點摘要" : heading[2];
      output.push(`<h${level} id="${slugify(text, usedSlugs)}">${renderInline(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      output.push("<hr>");
      index += 1;
      continue;
    }

    if (line.trim().startsWith("|") && isTableSeparator(lines[index + 1] || "")) {
      const table = renderTable(lines, index);
      output.push(table.html);
      index = table.nextIndex;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      output.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      output.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      output.push(`<blockquote><p>${renderInline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    if (paragraph.length) output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    else index += 1;
  }

  return output.join("\n");
}

async function fetchDocument(file) {
  if (!documentCache.has(file)) {
    const response = await fetch(`./content/${encodeURIComponent(file)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    documentCache.set(file, await response.text());
  }
  return documentCache.get(file);
}

function installDiagramControls(frame, diagram) {
  const svg = diagram.querySelector("svg");
  if (!svg) return;

  const viewBoxWidth = svg.viewBox?.baseVal?.width || 0;
  const baseWidth = Math.max(Math.ceil(viewBoxWidth), 960);
  let scale = 1;

  const toolbar = document.createElement("div");
  toolbar.className = "diagram-toolbar";
  toolbar.innerHTML = `
    <span>流程圖 · 可左右滑動</span>
    <div class="diagram-controls" aria-label="流程圖縮放控制">
      <button type="button" data-zoom="out" aria-label="縮小流程圖">−</button>
      <output aria-live="polite">100%</output>
      <button type="button" data-zoom="in" aria-label="放大流程圖">＋</button>
      <button type="button" data-zoom="reset">重設</button>
    </div>
  `;

  const output = toolbar.querySelector("output");
  const applyScale = () => {
    svg.style.width = `${Math.round(baseWidth * scale)}px`;
    svg.style.maxWidth = "none";
    svg.style.height = "auto";
    output.textContent = `${Math.round(scale * 100)}%`;
  };

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-zoom]");
    if (!button) return;
    const previousWidth = baseWidth * scale;
    const centerRatio = previousWidth > 0
      ? (diagram.scrollLeft + diagram.clientWidth / 2) / previousWidth
      : 0;
    if (button.dataset.zoom === "in") scale = Math.min(2.4, scale + .2);
    if (button.dataset.zoom === "out") scale = Math.max(.6, scale - .2);
    if (button.dataset.zoom === "reset") scale = 1;
    applyScale();
    requestAnimationFrame(() => {
      diagram.scrollLeft = Math.max(0, centerRatio * baseWidth * scale - diagram.clientWidth / 2);
    });
  });

  svg.setAttribute("role", "img");
  frame.insertBefore(toolbar, diagram);
  applyScale();
}

async function enhanceMermaidDiagrams() {
  const blocks = [...documentContent.querySelectorAll("pre.diagram-code")];
  if (!blocks.length) return;

  let frames = [];
  try {
    mermaidModulePromise ??= import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
    const mermaidModule = await mermaidModulePromise;
    const mermaid = mermaidModule.default || mermaidModule;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      flowchart: { curve: "linear", htmlLabels: false, useMaxWidth: false },
      sequence: { useMaxWidth: false, wrap: true },
      themeVariables: {
        background: "#ffffff",
        primaryColor: "#ffffff",
        primaryTextColor: "#000000",
        primaryBorderColor: "#000000",
        lineColor: "#000000",
        secondaryColor: "#f5f5f5",
        tertiaryColor: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      },
    });

    frames = blocks.map((block) => {
      const source = block.textContent;
      const frame = document.createElement("div");
      frame.className = "diagram-frame";
      const diagram = document.createElement("div");
      diagram.className = "mermaid diagram-render";
      diagram.textContent = source;
      const sourceDetails = document.createElement("details");
      sourceDetails.className = "diagram-source";
      sourceDetails.innerHTML = `<summary>查看 Mermaid 原始碼</summary><pre><code>${escapeHtml(source)}</code></pre>`;
      frame.append(diagram, sourceDetails);
      block.replaceWith(frame);
      return { frame, diagram };
    });

    await mermaid.run({ nodes: frames.map(({ diagram }) => diagram) });
    frames.forEach(({ frame, diagram }) => installDiagramControls(frame, diagram));
  } catch (error) {
    console.warn("Mermaid diagram enhancement failed; keeping source blocks.", error);
    frames.forEach(({ frame }) => frame.classList.add("diagram-failed"));
  }
}

async function loadDocument(file, { pushHistory = true } = {}) {
  currentFile = validDocument(file);
  updateNavigation(currentFile);
  updateDocumentMeta(currentFile);
  loading.hidden = false;
  documentContent.hidden = true;
  loadError.hidden = true;
  documentContent.setAttribute("aria-busy", "true");

  try {
    const markdown = await fetchDocument(currentFile);
    documentContent.innerHTML = renderMarkdown(markdown);
    documentContent.hidden = false;
    loading.hidden = true;
    documentContent.removeAttribute("aria-busy");
    enhanceMermaidDiagrams();
    if (pushHistory) history.pushState({ document: currentFile }, "", `?doc=${encodeURIComponent(currentFile)}`);
    readerMain.scrollTo({ top: 0, behavior: "auto" });
    setSidebarOpen(false);
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ block: "start" });
  } catch (error) {
    loading.hidden = true;
    loadError.hidden = false;
    loadErrorMessage.textContent = `無法讀取 ${currentFile}：${error.message}`;
    documentContent.removeAttribute("aria-busy");
  }
}

function handleDocumentLink(event) {
  const link = event.target.closest("[data-doc]");
  if (!link) return;
  event.preventDefault();
  const file = link.dataset.doc;
  if (documentByFile.has(file)) loadDocument(file);
}

renderNavigation();
documentContent.addEventListener("click", handleDocumentLink);
docNav.addEventListener("click", handleDocumentLink);
previousDoc.addEventListener("click", handleDocumentLink);
nextDoc.addEventListener("click", handleDocumentLink);
sidebarToggle.addEventListener("click", () => setSidebarOpen(!document.body.classList.contains("sidebar-open")));
sidebarClose.addEventListener("click", () => setSidebarOpen(false));
sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));
retryLoad.addEventListener("click", () => loadDocument(currentFile, { pushHistory: false }));
window.addEventListener("popstate", () => loadDocument(currentDocumentFromUrl(), { pushHistory: false }));

loadDocument(currentDocumentFromUrl(), { pushHistory: false });
