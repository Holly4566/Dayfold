import assert from "node:assert/strict";
import test from "node:test";
import { backupPayload, createInitialData, importBackup, isValidAppData, sortTasks } from "../src/data.js";

test("initial data contains eight categories and no demo tasks", () => {
  const data = createInitialData();
  assert.equal(data.categories.length, 8);
  assert.equal(data.tasks.length, 0);
  assert.equal(isValidAppData(data), true);
});

test("tasks sort by date, timed first, then untimed", () => {
  const tasks = [
    { id: "c", date: "2026-08-05", time: "", createdAt: "2026-01-01" },
    { id: "b", date: "2026-08-05", time: "14:30", createdAt: "2026-01-01" },
    { id: "a", date: "2026-08-04", time: "", createdAt: "2026-01-01" },
    { id: "d", date: "2026-08-05", time: "09:00", createdAt: "2026-01-01" },
  ];
  assert.deepEqual(sortTasks(tasks).map((task) => task.id), ["a", "d", "b", "c"]);
});

test("versioned backup round-trips", () => {
  const data = createInitialData();
  assert.deepEqual(importBackup(JSON.stringify(backupPayload(data))), data);
});

test("invalid backups are rejected", () => {
  assert.throws(() => importBackup('{"schemaVersion": 9}'));
});
