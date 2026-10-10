import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const grid = { innerHTML: "" };
const filters = { innerHTML: "", addEventListener() {} };
const status = { textContent: "" };
const progress = { style: {} };
const cached = {
  time: Date.now(),
  data: [{
    name: "Demo",
    description: "A & B \"research\" <img src=x onerror=alert(1)>",
    language: "<svg onload=alert(2)>",
    html_url: "javascript:alert(3)",
    stargazers_count: 4
  }]
};
const document = {
  documentElement: { dataset: { theme: "dark" }, scrollHeight: 1200 },
  getElementById(id) {
    return { projectGrid: grid, projectFilters: filters, syncStatus: status }[id] ?? null;
  },
  querySelector(selector) { return selector === ".progress" ? progress : null; },
  querySelectorAll() { return []; }
};
const sandbox = {
  window: { PORTFOLIO_PROJECTS: [{
    featured: false, name: "Demo", category: "Systems",
    fallback: "Fallback description", tech: "Python · Desktop"
  }] },
  document,
  localStorage: {
    getItem(key) {
      return key === "zjy-project-cache-v1" ? JSON.stringify(cached) : null;
    },
    setItem() {}
  },
  IntersectionObserver: class { observe() {} unobserve() {} },
  addEventListener() {},
  innerHeight: 800,
  scrollY: 0,
  matchMedia: () => ({ matches: true }),
  Date,
  Promise
};

vm.runInNewContext(source, sandbox, { filename: "app.js" });

assert.match(grid.innerHTML, /A &amp; B &quot;research&quot;/);
assert.match(grid.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
assert.match(grid.innerHTML, /&lt;svg onload=alert\(2\)&gt;/);
assert.doesNotMatch(grid.innerHTML, /<img\b|<svg\b|href="javascript:/);
assert.match(grid.innerHTML, /href="https:\/\/github.com\/ZJY-HSBL\/Demo"/);
assert.match(grid.innerHTML, /★ 4/);
assert.match(filters.innerHTML, /data-filter="Systems"/);
assert.equal(status.textContent, "Cached from GitHub · 1 projects");
console.log("Project card escaping regression test passed.");
