import * as fs from 'fs'
import * as path from 'path'
import { TypeOrmFileLogger } from './typeorm-logger'

describe('TypeOrmFileLogger', () => {
  const logDir = path.resolve(process.cwd(), 'logs')
  const logFile = path.join(logDir, 'test-slow-queries.log')

  beforeEach(() => {
    try {
      if (fs.existsSync(logFile)) fs.rmSync(logFile)
    } catch {}
  })

  it('writes slow queries to JSONL file', () => {
    const logger = new TypeOrmFileLogger(5, logFile)
    logger.logQuerySlow(10, 'SELECT 1', ['a'])

    const content = fs.readFileSync(logFile, 'utf8')
    expect(content.length).toBeGreaterThan(0)
    const firstLine = content.trim().split('\n')[0]
    const parsed = JSON.parse(firstLine)
    expect(parsed.query).toContain('SELECT 1')
    expect(parsed.durationMs).toBeGreaterThanOrEqual(10)
    expect(Array.isArray(parsed.parameters)).toBe(true)
  })
})
