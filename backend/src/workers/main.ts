import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { WorkersModule } from './worker.module'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkersModule, { logger: ['error', 'warn', 'log'] })
  const shutdown = async () => {
    try { await app.close() } catch {}
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker bootstrap failed', err)
  process.exit(1)
})
