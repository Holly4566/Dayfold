import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("PWA manifest uses paths relative to its deployment scope", async () => {
  const manifest = JSON.parse(await readProjectFile("public/manifest.webmanifest"));
  assert.equal(manifest.id, "./");
  assert.equal(manifest.start_url, "./#/daily");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.icons.every((icon) => !icon.src.startsWith("/")), true);
});

test("app and service worker derive URLs from the deployment base", async () => {
  const [index, main, serviceWorker] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("src/main.jsx"),
    readProjectFile("public/sw.js"),
  ]);
  assert.match(index, /%BASE_URL%manifest\.webmanifest/);
  assert.match(main, /import\.meta\.env\.BASE_URL/);
  assert.match(serviceWorker, /self\.registration\.scope/);
  assert.match(serviceWorker, /ignoreVary:\s*true/);
  assert.match(serviceWorker, /__DAYFOLD_BUILD_ID__/);
  assert.match(serviceWorker, /__DAYFOLD_PRECACHE__/);
});

test("local development is bound to this computer only", async () => {
  const viteConfig = await readProjectFile("vite.config.mjs");
  assert.match(viteConfig, /host:\s*["']127\.0\.0\.1["']/);
  assert.doesNotMatch(viteConfig, /host:\s*["']0\.0\.0\.0["']/);
});

test("GitHub Pages workflow is scoped and uses pinned official actions", async () => {
  const workflow = await readProjectFile(".github/workflows/deploy.yml");
  assert.match(workflow, /branches:\s*\["main"\]/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm audit --audit-level=high/);
  assert.match(workflow, /npm run build:pages/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.equal((workflow.match(/uses:\s*[^\s]+@[0-9a-f]{40}/g) || []).length, 5);
});
