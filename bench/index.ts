import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs'

import type { SpawnOptions } from 'child_process'
import type { Deferred, Event, Target } from 'benchmark'

import Benchmark from 'benchmark'
import spawn from 'cross-spawn'

// eslint-disable-next-line no-console
const log = console.log

const fileCount = 10

// To not polute the repo with a lot of tests, copy basic tests multiple times
function copyTestFiles() {
  for (let i = 0; i < fileCount; i++) {
    const path = `test/vue/test/${i}`
    if (!existsSync(path))
      mkdirSync(path)
  }

  const files = readdirSync('test/vue/test')
  for (const file of files.filter(f => f.endsWith('.ts'))) {
    for (let i = 0; i < fileCount; i++)
      copyFileSync(`test/vue/test/${file}`, `test/vue/test/${i}/${file}`)
  }
}

function removeTestFiles() {
  for (let i = 0; i < fileCount; i++)
    rmSync(`test/vue/test/${i}`, { recursive: true })
}

copyTestFiles()

const bench = new Benchmark.Suite()

bench.on('complete', () => {
  const results = bench
    .map((run: Target) => ({
      name: run.name,
      ...run.stats,
    }))
    .sort((a, b) => { return a.mean - b.mean })

  log('Name\t\t\t\tTime (in seconds)')

  for (const r of results)
    log(`${r.name}\t\t${r.mean.toFixed(3)} ± ${r.rme.toFixed(2)}%`)

  removeTestFiles()
})

bench.on('cycle', (event: Event) => {
  const benchmark = event.target
  log(benchmark?.toString())
})

const vueTest: SpawnOptions = { cwd: 'test/vue' }
bench.add('vitest (vue)', {
  defer: true,
  fn: (deferred: Deferred) => spawn('pnpm', ['test:vitest'], vueTest).on('exit', () => deferred.resolve()),
})
bench.add('vitest (vue) no-isolate', {
  defer: true,
  fn: (deferred: Deferred) => spawn('pnpm', ['test:vitest:no-isolate'], vueTest).on('exit', () => deferred.resolve()),
})
bench.add('jest (vue)', {
  defer: true,
  fn: (deferred: Deferred) => spawn('pnpm', ['test:jest'], vueTest).on('exit', () => deferred.resolve()),
})

bench.run()
