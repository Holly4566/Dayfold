#!/usr/bin/env node
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const index = path.join(client, "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute);
    return [path.relative(client, absolute).split(path.sep).join("/")];
  });
}

const serviceWorkerPath = path.join(client, "sw.js");
const serviceWorkerSource = readFileSync(serviceWorkerPath, "utf8");
if (!serviceWorkerSource.includes("__DAYFOLD_BUILD_ID__") || !serviceWorkerSource.includes("/* __DAYFOLD_PRECACHE__ */ []")) {
  throw new Error("Service worker build markers are missing");
}

const assetFiles = listFiles(path.join(client, "assets")).sort();
const buildFiles = listFiles(client).filter((file) => file !== "sw.js").sort();
const buildHash = createHash("sha256");
for (const file of buildFiles) {
  buildHash.update(file);
  buildHash.update(readFileSync(path.join(client, file)));
}
buildHash.update(serviceWorkerSource);

const builtServiceWorker = serviceWorkerSource
  .replace("__DAYFOLD_BUILD_ID__", buildHash.digest("hex").slice(0, 12))
  .replace("/* __DAYFOLD_PRECACHE__ */ []", JSON.stringify(assetFiles));
writeFileSync(serviceWorkerPath, builtServiceWorker);

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

console.log(`Prepared PWA cache for ${assetFiles.length} assets and Sites build output`);
