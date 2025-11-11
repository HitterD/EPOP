#!/usr/bin/env node
/*
 Simple search benchmark: runs N queries against /api/search and reports latency stats.
 Usage: node scripts/search-benchmark.mjs [N=100] [CONCURRENCY=4]
 Env: BASE (default http://localhost:3000)
*/
const BASE = process.env.BASE || 'http://localhost:3000'
const N = Number(process.argv[2] || 100)
const CONC = Number(process.argv[3] || 4)

const queries = [
  'hello', 'design', 'project', 'user', 'file', 'meeting', 'task', 'urgent', 'review', 'report',
  'chat', 'mail', 'compose', 'kanban', 'gantt', 'list', 'search', 'presence', 'socket', 'admin'
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function runOnce() {
  const q = pick(queries)
  const url = `${BASE}/api/search?q=${encodeURIComponent(q)}&limit=20`
  const t0 = performance.now()
  const res = await fetch(url)
  const t1 = performance.now()
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  await res.json().catch(() => ({}))
  return t1 - t0
}

async function worker(count, results) {
  for (let i = 0; i < count; i++) {
    try { results.push(await runOnce()) } catch (e) { results.push(NaN) }
  }
}

function stats(arr) {
  const ok = arr.filter((x) => Number.isFinite(x)).sort((a, b) => a - b)
  const p = (q) => ok[Math.min(ok.length - 1, Math.floor(q * ok.length))] || 0
  const sum = ok.reduce((a, b) => a + b, 0)
  return {
    count: arr.length,
    ok: ok.length,
    fail: arr.length - ok.length,
    avg: ok.length ? sum / ok.length : 0,
    p50: p(0.5),
    p90: p(0.9),
    p95: p(0.95),
    p99: p(0.99),
  }
}

async function main() {
  console.log(`Benchmarking /api/search at ${BASE} with N=${N}, CONC=${CONC}`)
  const per = Math.floor(N / CONC)
  const extra = N % CONC
  const results = []
  const tasks = []
  for (let i = 0; i < CONC; i++) {
    tasks.push(worker(per + (i < extra ? 1 : 0), results))
  }
  await Promise.all(tasks)
  const s = stats(results)
  console.log(JSON.stringify(s, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
