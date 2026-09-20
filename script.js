const STATUS_LABELS = {
  compatible: "対応",
  ok: "対応",
  warning: "注意",
  unknown: "未確認",
  incompatible: "非対応",
  bad: "非対応"
};

const normalizeStatus = (status) => ({
  ok: "compatible",
  bad: "incompatible"
}[status] || status || "unknown");

const byId = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadJson(path, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const separator = path.includes("?") ? "&" : "?";
      const response = await fetch(
        `${path}${separator}_=${Date.now()}-${attempt}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`${path} を読み込めませんでした (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(700 * attempt);
    }
  }

  throw lastError;
}

async function loadJsonWithFallback(primary, fallback) {
  try {
    return await loadJson(primary);
  } catch (primaryError) {
    if (!fallback) throw primaryError;
    return loadJson(fallback);
  }
}

function renderApps(apps) {
  const body = byId("apps-body");
  const query = byId("search").value.trim().toLowerCase();
  const filtered = apps.filter((app) => [
    app.name, app.vendor, app.summary, app.notes, app.status, ...(app.components || [])
  ].filter(Boolean).join(" ").toLowerCase().includes(query));

  body.innerHTML = filtered.length ? filtered.map((app) => {
    const status = normalizeStatus(app.status);
    return `
      <tr>
        <th scope="row">${escapeHtml(app.name)}</th>
        <td>${escapeHtml(app.vendor || "—")}</td>
        <td><span class="status status-${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[app.status] || STATUS_LABELS[status] || app.status || "未確認")}</span></td>
        <td>${escapeHtml(app.checked_at || "—")}</td>
        <td>${escapeHtml(app.summary || app.notes || "—")}</td>
      </tr>
    `;
  }).join("") : '<tr><td colspan="5" class="empty">該当するアプリはありません。</td></tr>';

  byId("state").textContent = `${filtered.length}件を表示中`;
}

function normalizeSources(sourceData) {
  if (Array.isArray(sourceData?.sources)) return sourceData.sources;

  if (Array.isArray(sourceData?.products)) {
    return sourceData.products.flatMap((product) =>
      (product.sources || []).map((source) => ({
        title: `${product.name}: ${source.label || source.type || "公式情報"}`,
        url: source.url,
        checked_at: product.checked_at || ""
      }))
    );
  }

  return [];
}

function renderSources(sources) {
  byId("sources-list").innerHTML = sources.length
    ? sources.map((source) => `<li><a href="${escapeHtml(source.url || "#")}">${escapeHtml(source.title || source.url || "確認元")}</a><span>${escapeHtml(source.checked_at || "")}</span></li>`).join("")
    : '<li class="empty">確認元はまだ登録されていません。</li>';
}

async function init() {
  let appData;

  try {
    appData = await loadJsonWithFallback(
      "apps.json",
      "https://raw.githubusercontent.com/ponhouse/macos-compat/main/apps.json"
    );
  } catch (error) {
    byId("state").textContent = `アプリデータの読み込みに失敗しました: ${error.message}`;
    byId("apps-body").innerHTML = '<tr><td colspan="5" class="empty">データを読み込めませんでした。少し待って再読み込みしてください。</td></tr>';
    return;
  }

  const apps = Array.isArray(appData.apps) ? appData.apps : [];

  byId("updated-at").textContent = appData.meta?.updated_at || appData.updated_at || "—";
  byId("total-count").textContent = apps.length;
  byId("checked-count").textContent = apps.filter((app) => ["compatible", "incompatible"].includes(normalizeStatus(app.status))).length;
  byId("attention-count").textContent = apps.filter((app) => ["warning", "unknown"].includes(normalizeStatus(app.status))).length;

  byId("search").addEventListener("input", () => renderApps(apps));
  renderApps(apps);

  try {
    const sourceData = await loadJsonWithFallback(
      "research_sources.json",
      "https://raw.githubusercontent.com/ponhouse/macos-compat/main/research_sources.json"
    );
    renderSources(normalizeSources(sourceData));
  } catch (error) {
    byId("sources-list").innerHTML =
      `<li class="empty">確認元データだけ読み込めませんでした。アプリ一覧には影響ありません。</li>`;
  }
}

init();
