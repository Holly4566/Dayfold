import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const readBuildFile = (relativePath) => readFile(new URL(`../dist/client/${relativePath}`, import.meta.url), "utf8");

test("GitHub Pages build emits Dayfold-scoped entry URLs", async () => {
  const index = await readBuildFile("index.html");
  assert.match(index, /\/Dayfold\/assets\//);
  assert.match(index, /\/Dayfold\/manifest\.webmanifest/);
  assert.match(index, /\/Dayfold\/icons\/icon-192\.png/);
});

test("built service worker contains a complete, versioned precache", async () => {
  const serviceWorker = await readBuildFile("sw.js");
  assert.doesNotMatch(serviceWorker, /__DAYFOLD_BUILD_ID__|__DAYFOLD_PRECACHE__/);
  const precacheMatch = serviceWorker.match(/const PRECACHE_ASSETS = (\[[^;]*\]);/);
  assert.ok(precacheMatch, "precache asset list should be present");
  const assets = JSON.parse(precacheMatch[1]);
  assert.ok(assets.length >= 2, "JavaScript and CSS assets should be precached");
  await Promise.all(assets.map((asset) => access(new URL(`../dist/client/${asset}`, import.meta.url))));
});
