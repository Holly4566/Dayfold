export const PERIODS = ["daily", "weekly", "monthly", "recent"];
export const STORAGE_KEY = "rizu.app.v1";
export const SCHEMA_VERSION = 1;

const DEFAULT_CATEGORIES = [
  ["thesis", "论文"],
  ["recruitment", "校招"],
  ["exercise", "运动"],
  ["ai", "AI"],
  ["editing", "剪辑"],
  ["photography", "摄影"],
  ["drawing", "板绘"],
  ["other", "其它"],
];

export function createInitialData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    categories: DEFAULT_CATEGORIES.map(([id, name], order) => ({ id, name, order, hidden: false })),
    tasks: [],
  };
}

export function createId(prefix = "item") {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

export function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function formatTaskDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
  if (!match) return date || "";
  return `${Number(match[2])}月${Number(match[3])}日`;
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    const aTime = a.time || "99:99";
    const bTime = b.time || "99:99";
    const byTime = aTime.localeCompare(bTime);
    if (byTime !== 0) return byTime;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function isDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function isTime(value) {
  return value === "" || (typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

export function isValidAppData(value) {
  if (!value || typeof value !== "object" || value.schemaVersion !== SCHEMA_VERSION) return false;
  if (!Array.isArray(value.categories) || !Array.isArray(value.tasks)) return false;

  const categoryIds = new Set();
  for (const category of value.categories) {
    if (!category || typeof category !== "object") return false;
    if (typeof category.id !== "string" || !category.id || categoryIds.has(category.id)) return false;
    if (typeof category.name !== "string" || !category.name.trim()) return false;
    if (typeof category.order !== "number" || typeof category.hidden !== "boolean") return false;
    categoryIds.add(category.id);
  }

  const taskIds = new Set();
  for (const task of value.tasks) {
    if (!task || typeof task !== "object") return false;
    if (typeof task.id !== "string" || !task.id || taskIds.has(task.id)) return false;
    if (!["global", "category"].includes(task.scopeType)) return false;
    if (!PERIODS.includes(task.period)) return false;
    if (task.scopeType === "category" && !categoryIds.has(task.categoryId)) return false;
    if (typeof task.title !== "string" || !task.title.trim()) return false;
    if (!isDate(task.date) || !isTime(task.time || "")) return false;
    if (typeof task.completed !== "boolean") return false;
    if (typeof task.createdAt !== "string" || typeof task.updatedAt !== "string") return false;
    taskIds.add(task.id);
  }
  return true;
}

export function loadData() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return createInitialData();
    const parsed = JSON.parse(raw);
    return isValidAppData(parsed) ? parsed : createInitialData();
  } catch {
    return createInitialData();
  }
}

export function saveData(data) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be blocked in private modes; the live UI remains usable.
  }
}

export function backupPayload(data) {
  return { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
}

export function exportBackup(data, prefix = "日序-备份") {
  const blob = new Blob([JSON.stringify(backupPayload(data), null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${prefix}-${getToday()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("这不是有效的 JSON 备份");
  }
  if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || !isValidAppData(parsed.data)) {
    throw new Error("备份版本或数据结构不受支持");
  }
  return parsed.data;
}
