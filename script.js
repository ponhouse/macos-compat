const STATUS_LABELS = {
  compatible: "対応",
  warning: "注意",
  unknown: "未確認",
  incompatible: "非対応"
};

const byId = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} を読み込めませんでした (${response.status})`);
  return response.json();
}

function renderApps(apps) {
  const body = byId("apps-body");
  const query = byId("search").value.trim().toLowerCase();
  const filtered = apps.filter((app) => [
    app.name, app.vendor, app.notes, app.status
  ].filter(Boolean).join(" ").toLowerCase().includes(query));

  body.innerHTML = filtered.length ? filtered.map((app) => `
    <tr>
      <th scope="row">${escapeHtml(app.name)}</th>
      <td>${escapeHtml(app.vendor || "—")}</td>
      <td><span class="status status-${escapeHtml(app.status || "unknown")}">${escapeHtml(STATUS_LABELS[app.status] || app.status || "未確認")}</span></td>
      <td>${escapeHtml(app.checked_at || "—")}</td>
      <td>${escapeHtml(app.notes || "—")}</td>
    </tr>
  `).join("") : '<tr><td colspan="5" class="empty">該当するアプリはありません。</td></tr>';

  byId("state").textContent = `${filtered.length}件を表示中`;
}

async function init() {
  try {
    const [appData, sourceData] = await Promise.all([
      loadJson("apps.json"),
      loadJson("research_sources.json")
    ]);
    const apps = Array.isArray(appData.apps) ? appData.apps : [];
    const sources = Array.isArray(sourceData.sources) ? sourceData.sources : [];

    byId("updated-at").textContent = appData.updated_at || "—";
    byId("total-count").textContent = apps.length;
    byId("checked-count").textContent = apps.filter((app) => ["compatible", "incompatible"].includes(app.status)).length;
    byId("attention-count").textContent = apps.filter((app) => ["warning", "unknown"].includes(app.status)).length;
    byId("sources-list").innerHTML = sources.length
      ? sources.map((source) => `<li><a href="${escapeHtml(source.url || "#")}">${escapeHtml(source.title || source.url || "確認元")}</a><span>${escapeHtml(source.checked_at || "")}</span></li>`).join("")
      : '<li class="empty">確認元はまだ登録されていません。</li>';

    byId("search").addEventListener("input", () => renderApps(apps));
    renderApps(apps);
  } catch (error) {
    byId("state").textContent = error.message;
  }
}

init();
