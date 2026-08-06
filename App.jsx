import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconChevronRight,
  IconDownload,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconMenu2,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import {
  PERIODS,
  createId,
  exportBackup,
  formatTaskDate,
  getToday,
  importBackup,
  loadData,
  saveData,
  sortTasks,
} from "./data.js";

const PERIOD_LABELS = { daily: "每日", weekly: "每周", monthly: "每月", recent: "最近" };

function parseRoute(hash) {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "settings") return { type: "settings" };
  if (parts[0] === "category" && parts[1]) {
    return {
      type: "category",
      categoryId: parts[1],
      period: PERIODS.includes(parts[2]) ? parts[2] : "daily",
    };
  }
  return { type: "global", period: PERIODS.includes(parts[0]) ? parts[0] : "daily" };
}

function routeHash(route) {
  if (route.type === "settings") return "#/settings";
  if (route.type === "category") return `#/category/${route.categoryId}/${route.period}`;
  return `#/${route.period}`;
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

function NakedAdd({ label = "添加事项", className = "", concealed = false, onActivate }) {
  const [blooming, setBlooming] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function activate() {
    setBlooming(false);
    window.requestAnimationFrame(() => setBlooming(true));
    timers.current.push(window.setTimeout(onActivate, 40));
    timers.current.push(window.setTimeout(() => setBlooming(false), 240));
  }

  return (
    <button
      type="button"
      className={`naked-add ${className} ${concealed ? "is-concealed" : ""}`}
      aria-label={label}
      tabIndex={concealed ? -1 : 0}
      onClick={activate}
    >
      <span className={`ink-bloom ${blooming ? "is-animating" : ""}`} aria-hidden="true" />
      <IconPlus size={28} stroke={1.15} />
    </button>
  );
}

function Sidebar({ categories, route, open, onClose, onNavigate }) {
  const visibleCategories = categories
    .filter((category) => !category.hidden)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <button
        type="button"
        className={`drawer-scrim ${open ? "is-open" : ""}`}
        aria-label="关闭导航"
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="主导航">
        <div className="sidebar-topline">
          <button className="brand" type="button" onClick={() => onNavigate({ type: "global", period: "daily" })}>
            日序
          </button>
          <IconButton className="drawer-close" label="关闭导航" onClick={onClose}>
            <IconX size={21} stroke={1.5} />
          </IconButton>
        </div>

        <nav className="nav-groups">
          <section className="nav-group" aria-labelledby="time-plan-label">
            <h2 id="time-plan-label">时间计划</h2>
            <div className="nav-list">
              {PERIODS.map((period) => (
                <button
                  type="button"
                  key={period}
                  className={`nav-row ${route.type === "global" && route.period === period ? "is-active" : ""}`}
                  onClick={() => onNavigate({ type: "global", period })}
                >
                  {PERIOD_LABELS[period]}
                </button>
              ))}
            </div>
          </section>

          <section className="nav-group category-group" aria-labelledby="category-label">
            <div className="nav-heading-row">
              <h2 id="category-label">分类</h2>
              <IconButton label="新建分类" onClick={() => onNavigate({ type: "settings" })}>
                <IconPlus size={19} stroke={1.45} />
              </IconButton>
            </div>
            <div className="nav-list category-list">
              {visibleCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`nav-row category-row ${route.type === "category" && route.categoryId === category.id ? "is-active" : ""}`}
                  onClick={() => onNavigate({ type: "category", categoryId: category.id, period: "daily" })}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className={`settings-link ${route.type === "settings" ? "is-active" : ""}`}
            onClick={() => onNavigate({ type: "settings" })}
          >
            <IconSettings size={19} stroke={1.45} />
            <span>设置</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function PeriodTabs({ route, onNavigate }) {
  return (
    <div className="period-tabs" role="tablist" aria-label="时间周期">
      {PERIODS.map((period) => (
        <button
          type="button"
          key={period}
          role="tab"
          aria-selected={route.period === period}
          className={route.period === period ? "is-active" : ""}
          onClick={() => onNavigate({ ...route, period })}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}

function TaskFields({ value, onChange, onSubmit, onCancel, mode = "add", onDelete }) {
  const titleRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), mode === "add" ? 55 : 0);
    return () => window.clearTimeout(timer);
  }, [mode]);

  function submit(event) {
    event.preventDefault();
    if (!value.title.trim()) {
      setError("请先写下事项");
      titleRef.current?.focus();
      return;
    }
    if (!value.date) {
      setError("请选择日期");
      return;
    }
    setError("");
    onSubmit();
  }

  return (
    <form className={`task-fields ${mode === "edit" ? "is-editing" : ""}`} onSubmit={submit}>
      <input
        ref={titleRef}
        className="task-title-input"
        type="text"
        value={value.title}
        placeholder="写下事项…"
        aria-label="事项标题"
        onChange={(event) => onChange({ ...value, title: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
      />
      <div className="task-field-meta">
        <input
          type="date"
          value={value.date}
          aria-label="日期"
          required
          onChange={(event) => onChange({ ...value, date: event.target.value })}
        />
        <input
          type="time"
          value={value.time}
          aria-label="时间（可选）"
          onChange={(event) => onChange({ ...value, time: event.target.value })}
        />
      </div>
      <div className="task-field-actions">
        <IconButton label="保存" className="save-action" onClick={submit}>
          <IconCheck size={19} stroke={1.55} />
        </IconButton>
        <IconButton label="取消" onClick={onCancel}>
          <IconX size={19} stroke={1.45} />
        </IconButton>
        {mode === "edit" && (
          <IconButton label="删除" className="delete-action" onClick={onDelete}>
            <IconTrash size={18} stroke={1.45} />
          </IconButton>
        )}
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  );
}

function Composer({ open, onOpen, onClose, onAdd }) {
  const [draft, setDraft] = useState({ title: "", date: getToday(), time: "" });

  useEffect(() => {
    if (!open) setDraft({ title: "", date: getToday(), time: "" });
  }, [open]);

  return (
    <div className={`composer ${open ? "is-open" : ""}`}>
      <NakedAdd className="desktop-add" concealed={open} onActivate={onOpen} />
      {open && (
        <div className="composer-expanded">
          <span className="composer-mark" aria-hidden="true">
            <IconPlus size={27} stroke={1.1} />
          </span>
          <TaskFields
            value={draft}
            onChange={setDraft}
            onCancel={onClose}
            onSubmit={() => {
              onAdd(draft);
              onClose();
            }}
          />
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: task.title, date: task.date, time: task.time || "" });
  const overdue = !task.completed && task.date < getToday();

  useEffect(() => {
    setDraft({ title: task.title, date: task.date, time: task.time || "" });
  }, [task]);

  if (editing) {
    return (
      <div className="task-row task-row-edit">
        <TaskFields
          mode="edit"
          value={draft}
          onChange={setDraft}
          onCancel={() => setEditing(false)}
          onDelete={() => onDelete(task)}
          onSubmit={() => {
            onEdit(task.id, draft);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <article className={`task-row ${task.completed ? "is-completed" : ""}`}>
      <label className="task-check">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="sr-only">{task.completed ? "取消完成" : "标记完成"}</span>
      </label>
      <button type="button" className="task-content" onClick={() => setEditing(true)}>
        <span className="task-title">{task.title}</span>
        <span className={`task-date ${overdue ? "is-overdue" : ""}`}>
          {formatTaskDate(task.date)}{task.time ? `  ${task.time}` : ""}
        </span>
      </button>
      <IconButton label={`编辑 ${task.title}`} className="edit-task" onClick={() => setEditing(true)}>
        <IconEdit size={19} stroke={1.35} />
      </IconButton>
    </article>
  );
}

function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  const [completedOpen, setCompletedOpen] = useState(false);
  const active = useMemo(() => sortTasks(tasks.filter((task) => !task.completed)), [tasks]);
  const completed = useMemo(() => sortTasks(tasks.filter((task) => task.completed)), [tasks]);

  return (
    <div className="task-list">
      <div className="active-tasks">
        {active.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      {completed.length > 0 && (
        <section className="completed-section">
          <button
            type="button"
            className="completed-toggle"
            aria-expanded={completedOpen}
            onClick={() => setCompletedOpen((value) => !value)}
          >
            <IconChevronRight className={completedOpen ? "is-open" : ""} size={18} stroke={1.45} />
            <span>已完成</span>
            <span>{completed.length}</span>
          </button>
          {completedOpen && (
            <div className="completed-tasks">
              {completed.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ConfirmDialog({ open, title, description, confirmLabel, tone = "danger", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      className="dialog-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{description}</p>
        <div className="dialog-actions">
          <button type="button" className="quiet-button" onClick={onCancel}>取消</button>
          <button type="button" className={tone === "danger" ? "dark-button danger-button" : "dark-button"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsPage({ data, setData, showToast, requestImport }) {
  const [newName, setNewName] = useState("");
  const ordered = [...data.categories].sort((a, b) => a.order - b.order);

  function updateCategory(id, changes) {
    setData((current) => ({
      ...current,
      categories: current.categories.map((category) => category.id === id ? { ...category, ...changes } : category),
    }));
  }

  function moveCategory(id, direction) {
    const index = ordered.findIndex((category) => category.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setData((current) => ({
      ...current,
      categories: next.map((category, order) => ({ ...category, order })),
    }));
  }

  function addCategory(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (data.categories.some((category) => category.name === name)) {
      showToast("这个分类已经存在");
      return;
    }
    setData((current) => ({
      ...current,
      categories: [...current.categories, { id: createId("category"), name, hidden: false, order: current.categories.length }],
    }));
    setNewName("");
    showToast("分类已添加");
  }

  return (
    <div className="settings-page">
      <section className="settings-section">
        <div className="settings-section-heading">
          <h2>分类管理</h2>
          <p>调整名称、顺序和侧栏显示。</p>
        </div>

        <form className="add-category" onSubmit={addCategory}>
          <input
            type="text"
            value={newName}
            placeholder="新分类名称"
            aria-label="新分类名称"
            onChange={(event) => setNewName(event.target.value)}
          />
          <IconButton label="添加分类" className="category-add-button" onClick={addCategory}>
            <IconPlus size={22} stroke={1.35} />
          </IconButton>
        </form>

        <div className="category-settings-list">
          {ordered.map((category, index) => (
            <div className="category-setting-row" key={category.id}>
              <input
                type="text"
                value={category.name}
                aria-label="分类名称"
                onChange={(event) => updateCategory(category.id, { name: event.target.value })}
                onBlur={(event) => {
                  if (!event.target.value.trim()) updateCategory(category.id, { name: "未命名" });
                }}
              />
              <div className="category-setting-actions">
                <IconButton label="上移" disabled={index === 0} onClick={() => moveCategory(category.id, -1)}>
                  <IconArrowUp size={18} stroke={1.4} />
                </IconButton>
                <IconButton label="下移" disabled={index === ordered.length - 1} onClick={() => moveCategory(category.id, 1)}>
                  <IconArrowDown size={18} stroke={1.4} />
                </IconButton>
                <IconButton label={category.hidden ? "显示" : "隐藏"} onClick={() => updateCategory(category.id, { hidden: !category.hidden })}>
                  {category.hidden ? <IconEye size={18} stroke={1.4} /> : <IconEyeOff size={18} stroke={1.4} />}
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section backup-section">
        <div className="settings-section-heading">
          <h2>数据备份</h2>
          <p>数据只保存在当前浏览器。换设备前请先导出备份。</p>
        </div>
        <div className="backup-actions">
          <button type="button" className="outline-button" onClick={() => {
            exportBackup(data);
            showToast("备份已导出");
          }}>
            <IconDownload size={18} stroke={1.4} />
            导出 JSON
          </button>
          <button type="button" className="outline-button" onClick={requestImport}>
            <IconUpload size={18} stroke={1.4} />
            导入 JSON
          </button>
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [data, setData] = useState(loadData);
  const [route, setRoute] = useState({ type: "global", period: "daily" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/daily`);
    setRoute({ type: "global", period: "daily" });
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => saveData(data), [data]);

  useEffect(() => {
    setComposerOpen(false);
  }, [route.type, route.period, route.categoryId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const category = route.type === "category"
    ? data.categories.find((item) => item.id === route.categoryId)
    : null;
  const pageTitle = route.type === "settings"
    ? "设置"
    : route.type === "category"
      ? category?.name || "分类"
      : PERIOD_LABELS[route.period];

  const visibleTasks = useMemo(() => {
    if (route.type === "settings") return [];
    return data.tasks.filter((task) => {
      if (task.period !== route.period) return false;
      if (route.type === "global") return task.scopeType === "global";
      return task.scopeType === "category" && task.categoryId === route.categoryId;
    });
  }, [data.tasks, route]);

  function navigate(nextRoute) {
    const hash = routeHash(nextRoute);
    if (window.location.hash === hash) setRoute(nextRoute);
    else window.location.hash = hash;
    setDrawerOpen(false);
  }

  function addTask(draft) {
    const now = new Date().toISOString();
    const task = {
      id: createId("task"),
      scopeType: route.type === "category" ? "category" : "global",
      categoryId: route.type === "category" ? route.categoryId : null,
      period: route.period,
      title: draft.title.trim(),
      date: draft.date,
      time: draft.time || "",
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    setData((current) => ({ ...current, tasks: [...current.tasks, task] }));
    setToast("事项已记下");
  }

  function updateTask(id, changes) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === id
        ? { ...task, ...changes, title: changes.title.trim(), time: changes.time || "", updatedAt: new Date().toISOString() }
        : task),
    }));
    setToast("事项已更新");
  }

  function toggleTask(id) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === id
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        : task),
    }));
  }

  function deleteTask() {
    if (!pendingDelete) return;
    setData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== pendingDelete.id) }));
    setPendingDelete(null);
    setToast("事项已删除");
  }

  async function readImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setPendingImport(importBackup(await file.text()));
    } catch (error) {
      setToast(error instanceof Error ? error.message : "备份文件无法读取");
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    exportBackup(data, "日序-导入前安全备份");
    setData(pendingImport);
    setPendingImport(null);
    navigate({ type: "global", period: "daily" });
    setToast("数据已导入");
  }

  return (
    <div className="app-shell">
      <Sidebar
        categories={data.categories}
        route={route}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={navigate}
      />

      <main className="workspace">
        <header className="mobile-header">
          <IconButton label="打开导航" onClick={() => setDrawerOpen(true)}>
            <IconMenu2 size={25} stroke={1.35} />
          </IconButton>
          <button type="button" className="mobile-brand" onClick={() => navigate({ type: "global", period: "daily" })}>日序</button>
          {route.type !== "settings" ? (
            <NakedAdd className="mobile-add" onActivate={() => setComposerOpen(true)} />
          ) : <span className="mobile-header-spacer" />}
        </header>

        <div className="content-frame">
          <header className="page-header">
            <h1>{pageTitle}</h1>
            {route.type !== "settings" && <PeriodTabs route={route} onNavigate={navigate} />}
          </header>

          {route.type === "settings" ? (
            <SettingsPage
              data={data}
              setData={setData}
              showToast={setToast}
              requestImport={() => importInputRef.current?.click()}
            />
          ) : (
            <>
              <Composer open={composerOpen} onOpen={() => setComposerOpen(true)} onClose={() => setComposerOpen(false)} onAdd={addTask} />
              <TaskList
                key={`${route.type}-${route.categoryId || "global"}-${route.period}`}
                tasks={visibleTasks}
                onToggle={toggleTask}
                onEdit={updateTask}
                onDelete={setPendingDelete}
              />
            </>
          )}
        </div>
      </main>

      <input ref={importInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={readImportFile} />
      <div className={`toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="删除这条事项？"
        description={pendingDelete ? `“${pendingDelete.title}”删除后无法恢复。` : ""}
        confirmLabel="删除"
        onConfirm={deleteTask}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="替换当前全部数据？"
        description="导入会覆盖当前分类和事项。系统会先自动下载一份安全备份。"
        confirmLabel="继续导入"
        tone="normal"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}
