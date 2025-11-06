import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { FilesService } from '../files/files.service'

@Injectable()
export class FilesLifecycleWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FilesLifecycleWorker.name)
  private tempTimer: NodeJS.Timeout | null = null
  private retentionTimer: NodeJS.Timeout | null = null

  constructor(private readonly files: FilesService) {}

  onModuleInit() {
    // Purge temporary uploads older than 24h every 15 minutes
    this.tempTimer = setInterval(async () => {
      try {
        const res = await this.files.purgeTemp(24)
        if (res?.deleted) this.logger.log(`purgeTemp deleted=${res.deleted}`)
      } catch (e: any) {
        this.logger.warn(`purgeTemp failed: ${String(e?.message || e)}`)
      }
    }, 15 * 60 * 1000)

    // Purge files with expired retention every hour
    this.retentionTimer = setInterval(async () => {
      try {
        const res = await this.files.purgeRetentionExpired(500)
        if (res?.deleted) this.logger.log(`purgeRetentionExpired deleted=${res.deleted}`)
      } catch (e: any) {
        this.logger.warn(`purgeRetentionExpired failed: ${String(e?.message || e)}`)
      }
    }, 60 * 60 * 1000)
  }

  onModuleDestroy() {
    if (this.tempTimer) clearInterval(this.tempTimer)
    if (this.retentionTimer) clearInterval(this.retentionTimer)
  }
}
