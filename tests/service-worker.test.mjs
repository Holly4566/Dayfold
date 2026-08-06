import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const scope = "https://example.test/Dayfold/";
const workerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

function loadWorker(cachedResponses, fetchImpl) {
  const handlers = {};
  const requestedFromNetwork = [];
  const normalizePath = (request) => {
    const value = typeof request === "string" ? request : request.url;
    return new URL(value, scope).pathname;
  };
  const caches = {
    open: async () => ({ addAll: async () => {}, put: async () => {} }),
    keys: async () => [],
    delete: async () => true,
    match: async (request) => cachedResponses.get(normalizePath(request))?.clone(),
  };
  const self = {
    registration: { scope },
    location: new URL(scope),
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (name, handler) => { handlers[name] = handler; },
  };
  const fetch = async (request) => {
    requestedFromNetwork.push(normalizePath(request));
    return fetchImpl(request);
  };
  vm.runInNewContext(workerSource, { self, caches, fetch, URL, Response, Set });
  return { handlers, requestedFromNetwork };
}

async function dispatchFetch(handler, request) {
  let responsePromise;
  handler({ request, respondWith: (promise) => { responsePromise = promise; } });
  assert.ok(responsePromise, "service worker should handle this request");
  return responsePromise;
}

test("offline navigation returns the cached app shell without trying the network", async () => {
  const cached = new Map([["/Dayfold/index.html", new Response("offline app")]]);
  const worker = loadWorker(cached, async () => { throw new Error("offline"); });
  const response = await dispatchFetch(worker.handlers.fetch, {
    method: "GET",
    mode: "navigate",
    url: "https://example.test/Dayfold/",
  });
  assert.equal(await response.text(), "offline app");
  assert.deepEqual(worker.requestedFromNetwork, []);
});

test("pre-cached JavaScript is returned before any network request", async () => {
  const cached = new Map([["/Dayfold/assets/app.js", new Response("cached script")]]);
  const source = workerSource.replace("/* __DAYFOLD_PRECACHE__ */ []", '["assets/app.js"]');
  const handlers = {};
  const network = [];
  const caches = {
    match: async (request) => cached.get(new URL(typeof request === "string" ? request : request.url, scope).pathname)?.clone(),
    open: async () => ({ addAll: async () => {}, put: async () => {} }),
    keys: async () => [],
    delete: async () => true,
  };
  const self = {
    registration: { scope },
    location: new URL(scope),
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (name, handler) => { handlers[name] = handler; },
  };
  vm.runInNewContext(source, {
    self,
    caches,
    URL,
    Response,
    Set,
    fetch: async (request) => { network.push(request.url); throw new Error("offline"); },
  });
  const response = await dispatchFetch(handlers.fetch, {
    method: "GET",
    mode: "no-cors",
    url: "https://example.test/Dayfold/assets/app.js",
  });
  assert.equal(await response.text(), "cached script");
  assert.deepEqual(network, []);
});
