import { Logger, QueryRunner } from 'typeorm'
import * as fs from 'fs'
import * as path from 'path'

export class TypeOrmFileLogger implements Logger {
  constructor(
    private readonly slowThresholdMs: number = 200,
    private readonly slowLogFile: string = 'logs/slow-queries.log',
  ) {
    try {
      const dir = path.dirname(this.slowLogFile)
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    } catch {
      // noop - don't crash logger setup
    }
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    // Keep console debug lightweight in dev only
    // eslint-disable-next-line no-console
    console.debug?.(`[typeorm] query: ${query}${parameters && parameters.length ? ` -- params: ${JSON.stringify(parameters)}` : ''}`)
  }

  logQueryError(error: string | Error, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    // eslint-disable-next-line no-console
    console.error?.(`[typeorm] query error: ${String(error)}\n${query}${parameters && parameters.length ? `\nparams: ${JSON.stringify(parameters)}` : ''}`)
  }

  logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const payload = {
      ts: new Date().toISOString(),
      durationMs: time,
      thresholdMs: this.slowThresholdMs,
      query,
      parameters: parameters ?? [],
    }
    const line = JSON.stringify(payload) + '\n'
    try {
      fs.appendFileSync(this.slowLogFile, line)
    } catch {
      // eslint-disable-next-line no-console
      console.warn?.(`[typeorm] failed to write slow query log to ${this.slowLogFile}`)
    }
    // eslint-disable-next-line no-console
    console.warn?.(`[typeorm][slow ${time}ms] ${query}`)
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    // eslint-disable-next-line no-console
    console.info?.(`[typeorm][schema] ${message}`)
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    // eslint-disable-next-line no-console
    console.info?.(`[typeorm][migration] ${message}`)
  }

  log(level: 'log' | 'info' | 'warn', message: any, _queryRunner?: QueryRunner) {
    // eslint-disable-next-line no-console
    const fn = level === 'warn' ? console.warn : level === 'info' ? console.info : console.log
    fn?.(`[typeorm][${level}] ${message}`)
  }
}
