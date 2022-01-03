import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs'

import type { Options } from 'execa'
import type { Deferred, Event, Target } from 'benchmark'

import Benchmark from 'benchmark'
import { execa } from 'execa'

// eslint-disable-next-line no-console
const log = console.log

const fileCount = 50

// To not polute the repo with a lot of tests, copy basic tests multiple times
function copyTestFiles() {
  for (let i = 0; i < fileCount; i++) {
    const path = `test/vue/test/${i}`
    if (!existsSync(path))
      mkdirSync(path)
  }

  const files = readdirSync('test/vue/test')
  for (const file of files.filter(p => p.endsWith('.ts') || p.endsWith('.vue'))) {
    for (let i = 0; i < fileCount; i++)
      copyFileSync(`test/vue/test/${file}`, `test/vue/test/${i}/${file}`)
  }
}

function removeTestFiles() {
  for (let i = 0; i < fileCount; i++)
    rmSync(`test/vue/test/${i}`, { recursive: true })
}

function exit(exitCode: number) {
  if (exitCode > 0) {
    removeTestFiles()
    process.exit(exitCode)
  }
}

copyTestFiles()

const bench = new Benchmark.Suite()

bench.on('cycle', (event: Event) => {
  const benchmark = event.target
  log(benchmark?.toString())
})

const vueTest: Options = {
  cwd: 'test/vue',
  stdio: 'inherit',
}
bench.add('vitest', {
  defer: true,
  fn: (deferred: Deferred) => execa('pnpm', ['test:vitest'], vueTest)
    .on('exit', (code) => {
      if (code > 0)
        exit(code)
      else
        deferred.resolve()
    }),
})
bench.add('jest', {
  defer: true,
  fn: (deferred: Deferred) => execa('pnpm', ['test:jest'], vueTest)
    .on('exit', (code) => {
      if (code > 0)
        exit(code)
      else
        deferred.resolve()
    }),
})

export type Result = Benchmark.Stats & {
  name: string
}

export function runBench(callback: (data: Result[]) => void) {
  bench.on('complete', () => {
    const results = bench
      .map((run: Target): Result => ({
        name: run.name,
        ...run.stats,
      }))
      .sort((a, b) => { return a.mean - b.mean })

    callback(results)

    removeTestFiles()
  })

  bench.run()
}
