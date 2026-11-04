// The `command` of the test schedule (docs/tests/schedule.md): Agent M's test job runs it in the root of the checkout with
// the test files of one row as its arguments, and keeps the JUnit XML report it writes to AGENT_M_REPORT.
//
//   node prototype/scripts/agent-m-tests.mjs <file>...
//
// Files below tests/system run in Playwright against the production build, all others in Vitest. AGENT_M_SHARD of
// AGENT_M_SHARDS (from 1; both 1 where unset) takes its share of the sorted files. A case is named `TST-<nnn> <title>` where
// a declaration before it names one, as Agent M's result records expect, and by its own name where none does. The status is
// not 0 where a case failed or a run wrote no report.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PREFIX = "prototype/";
const SYSTEM = "tests/system/";

const whole = (name) => {
  const v = process.env[name];
  if (v === undefined || v === "") return 1;
  if (!/^[1-9][0-9]*$/.test(v)) throw new Error(`${name} is "${v}", not a whole number from 1`);
  return Number(v);
};

function run(program, args, env = {}) {
  return new Promise((done) => {
    const child = spawn(program, args, { cwd: APP, stdio: "inherit", env: { ...process.env, ...env } });
    child.on("error", (error) => { console.error(`${program}: ${error.message}`); done(127); });
    child.on("close", (status, signal) => done(status ?? (signal ? 1 : 0)));
  });
}

const STRING = /(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)/;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// A title as a pattern of the case names it gives: `%s`, `%d`, `%o` of it.each and `${…}` stand for any text.
const patternOf = (title) => new RegExp(`^${title.split(/%[sdifjoOp#]|\$\{[^}]*\}/).map(escape).join("[\\s\\S]*")}$`);

// The declarations of a file (`// TST-<nnn> · …`, the title on the first code line after the comment lines).
function declarations(file) {
  const lines = readFileSync(join(APP, file), "utf8").split("\n");
  const found = [];
  lines.forEach((line, at) => {
    const id = /^\s*\/\/\s*(TST-\d+)\b/.exec(line)?.[1];
    if (!id) return;
    let next = at + 1;
    while (next < lines.length && /^\s*\/\//.test(lines[next])) next++;
    const literal = STRING.exec(lines[next] ?? "");
    const title = literal ? (literal[1] ?? literal[2] ?? literal[3]) : null;
    if (title) found.push({ id, pattern: patternOf(title) });
  });
  return found;
}

const decode = (text) => text.replace(/&(lt|gt|amp|quot|apos);/g, (_, n) => ({ lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" })[n]);
const encode = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// The report's cases named by the declarations of their file: the case's classname or file names the file; the title is the
// name's last part after ` › ` or ` > ` (describe blocks), or the whole name.
function named(xml, files) {
  const byFile = new Map(files.map((f) => [f, declarations(f)]));
  return xml.replace(/<testcase\b[^>]*>/g, (tag) => {
    const attr = (k) => { const m = new RegExp(`\\s${k}="([^"]*)"`).exec(tag); return m ? decode(m[1]) : ""; };
    const name = attr("name");
    if (/^TST-\d+/.test(name)) return tag;
    const owner = files.find((f) => [attr("classname"), attr("file")].some((c) => c && (c.endsWith(f.replace(/^\.\//, "")) || f.endsWith(c.replace(/^\.\//, "")))))
      ?? (files.length === 1 ? files[0] : null);
    if (!owner) return tag;
    const parts = name.split(/ [›>] /);
    const candidates = [name, ...parts.map((_, i) => parts.slice(i).join(" > "))];
    const hit = byFile.get(owner).find((d) => candidates.some((c) => d.pattern.test(c)));
    return hit ? tag.replace(/\sname="[^"]*"/, ` name="${encode(`${hit.id} ${name}`)}"`) : tag;
  });
}

// What lies inside the root of a report; a case that fails where the run ended non-zero and wrote none.
function contentOf(path, label, status) {
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const root = /<testsuites\b[^>]*>([\s\S]*)<\/testsuites>/.exec(text);
  if (root) return root[1].trim();
  const own = /<testsuite\b[\s\S]*<\/testsuite>/.exec(text);
  if (own) return own[0];
  if (status === 0) return "";
  const q = encode(label);
  return `<testcase name="${q}" classname="${q}"><error message="${q} ended with status ${status} and wrote no report"/></testcase>`;
}

async function main() {
  const report = process.env.AGENT_M_REPORT;
  if (!report) throw new Error("AGENT_M_REPORT names no path for the report");
  const shards = whole("AGENT_M_SHARDS");
  const shard = whole("AGENT_M_SHARD");
  if (shard > shards) throw new Error(`AGENT_M_SHARD ${shard} is beyond AGENT_M_SHARDS ${shards}`);

  const given = process.argv.slice(2).map((f) => (f.startsWith(PREFIX) ? f.slice(PREFIX.length) : f)).sort();
  const mine = given.filter((_, i) => i % shards === shard - 1);
  const system = mine.filter((f) => f.startsWith(SYSTEM));
  const unit = mine.filter((f) => !f.startsWith(SYSTEM));
  console.log(`shard ${shard} of ${shards}: ${mine.length} file(s), ${unit.length} in Vitest and ${system.length} in Playwright`);

  const scratch = mkdtempSync(join(tmpdir(), "agent-m-report-"));
  try {
    const vitestReport = join(scratch, "vitest.xml");
    const playwrightReport = join(scratch, "playwright.xml");
    let vitestStatus = 0;
    let playwrightStatus = 0;
    if (unit.length) {
      vitestStatus = await run(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "--reporter=default", "--reporter=junit",
        `--outputFile.junit=${vitestReport}`, ...unit]);
    }
    if (system.length) {
      playwrightStatus = await run(process.execPath, ["node_modules/vite/bin/vite.js", "build"]);
      if (playwrightStatus === 0) {
        playwrightStatus = await run(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "--reporter=list,junit", ...system],
          { PLAYWRIGHT_JUNIT_OUTPUT_FILE: playwrightReport, CI: "true" });
      }
    }
    const content = [
      unit.length ? named(contentOf(vitestReport, "the Vitest run", vitestStatus), unit) : "",
      system.length ? named(contentOf(playwrightReport, "the Playwright run", playwrightStatus), system) : "",
    ].filter(Boolean).join("\n");
    mkdirSync(dirname(report), { recursive: true });
    writeFileSync(report, `<?xml version="1.0" encoding="utf-8"?>\n<testsuites>\n${content}\n</testsuites>\n`);
    return vitestStatus === 0 && playwrightStatus === 0 ? 0 : 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

main().then((status) => { process.exitCode = status; }, (error) => {
  console.error(`agent-m-tests: ${error.message}`);
  process.exitCode = 2;
});
