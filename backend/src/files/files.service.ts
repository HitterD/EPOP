import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { FileEntity } from '../entities/file.entity'
import { FileLink } from '../entities/file-link.entity'
import { ConfigService } from '@nestjs/config'
import { S3Client, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'
import { createPresignedPost, PresignedPost } from '@aws-sdk/s3-presigned-post'
import { v4 as uuidv4 } from 'uuid'
import { decodeCursor, encodeCursor } from '../common/pagination/cursor'
import type { Response } from 'express'
import { Readable } from 'node:stream'

@Injectable()
export class FilesService {
  private s3: S3Client
  private bucket: string

  constructor(
    @InjectRepository(FileEntity) private readonly files: Repository<FileEntity>,
    @InjectRepository(FileLink) private readonly links: Repository<FileLink>,
    private readonly config: ConfigService,
  ) {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT') || 'localhost'
    const port = this.config.get<number>('MINIO_PORT') || 9000
    const useSSL = !!this.config.get<boolean>('MINIO_USE_SSL')
    const accessKeyId = this.config.get<string>('MINIO_ACCESS_KEY') || 'minio'
    const secretAccessKey = this.config.get<string>('MINIO_SECRET_KEY') || 'minio123'
    this.bucket = this.config.get<string>('MINIO_BUCKET') || 'epop'
    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async presign(ownerId: string | null, filename: string) {
    const key = `uploads-temp/${uuidv4()}-${filename}`
    const form: PresignedPost = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 1, 50 * 1024 * 1024], // 50MB limit
      ],
      Expires: 300,
    })
    const file = await this.files.save(this.files.create({ ownerId: ownerId ?? null, filename, s3Key: key, mime: null, size: null }))
    const expiresAt = new Date(Date.now() + 300 * 1000).toISOString()
    // Back-compat: return both url and uploadUrl
    return { url: form.url, uploadUrl: form.url, fields: form.fields, fileId: file.id, key, expiresAt }
  }

  async attach(fileId: string, dto: { refTable: 'messages'|'mail_messages'|'tasks'; refId: string; filename?: string; mime?: string; size?: number }) {
    const file = await this.files.findOne({ where: { id: fileId } })
    if (!file) throw new NotFoundException('File not found')
    if (dto.filename !== undefined) file.filename = dto.filename
    if (dto.mime !== undefined) file.mime = dto.mime ?? null
    if (dto.size !== undefined) file.size = String(dto.size)
    await this.files.save(file)
    // Finalize: move from uploads-temp/* to uploads/* for permanence
    try {
      if (file.s3Key && file.s3Key.startsWith('uploads-temp/')) {
        const destKey = `uploads/${file.id}-${file.filename}`
        if (destKey !== file.s3Key) {
          await this.s3.send(new CopyObjectCommand({ Bucket: this.bucket, CopySource: `/${this.bucket}/${file.s3Key}`, Key: destKey }))
          try { await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: file.s3Key })) } catch {}
          file.s3Key = destKey
          await this.files.save(file)
        }
      }
    } catch {}
    const link = await this.links.save(this.links.create({ file: { id: fileId } as any, refTable: dto.refTable, refId: dto.refId }))
    return { success: true, linkId: link.id }
  }

  async get(id: string) {
    const file = await this.files.findOne({ where: { id } })
    if (!file) throw new NotFoundException('File not found')
    return file
  }

  async remove(id: string) {
    const file = await this.files.findOne({ where: { id } })
    if (!file) throw new NotFoundException('File not found')
    await this.files.remove(file)
    return { success: true }
  }

  async listMineCursor(userId: string, limit = 20, cursor: string | null = null) {
    const where: any = { ownerId: userId }
    const decoded = decodeCursor(cursor)
    if (decoded?.id) where.id = LessThan(decoded.id)
    const take = Math.max(1, Math.min(100, Number(limit))) + 1
    const rows = await this.files.find({ where, order: { id: 'DESC' as any }, take })
    const items = rows.slice(0, take - 1).reverse()
    const hasMore = rows.length === take
    const nextCursor = hasMore && items.length ? encodeCursor({ id: String(items[0].id) }) : undefined
    return { items, nextCursor, hasMore }
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'scanning' | 'ready' | 'infected' | 'failed',
    scanResult: string | null,
  ) {
    const file = await this.files.findOne({ where: { id } })
    if (!file) throw new NotFoundException('File not found')
    file.status = status as any
    if (status === 'ready' || status === 'infected' || status === 'failed') {
      file.scanResult = scanResult
      file.scannedAt = new Date() as any
    }
    await this.files.save(file)
    return { success: true }
  }

  async downloadToResponse(id: string, userId: string | null, res: Response) {
    const file = await this.files.findOne({ where: { id } })
    if (!file) throw new NotFoundException('File not found')
    // ACL: owner or linked context membership (chat participant / project member) or mail sender/recipient
    if (!userId) throw new ForbiddenException('Not permitted')
    if (!file.ownerId || String(file.ownerId) !== String(userId)) {
      const rows: Array<{ ok: number } > = await this.files.query(
        `SELECT 1 AS ok
         FROM files f
         LEFT JOIN file_links l ON l.file_id = f.id
         LEFT JOIN messages m ON (l.ref_table = 'messages' AND l.ref_id = m.id)
         LEFT JOIN chat_participants p ON (p.chat_id = m.chat_id AND p.user_id = $1)
         LEFT JOIN tasks t ON (l.ref_table = 'tasks' AND l.ref_id = t.id)
         LEFT JOIN project_members pm ON (pm.project_id = t.project_id AND pm.user_id = $1)
         LEFT JOIN mail_messages mm ON (l.ref_table = 'mail_messages' AND l.ref_id = mm.id)
         WHERE f.id = $2
           AND (
             p.user_id IS NOT NULL
             OR pm.user_id IS NOT NULL
             OR mm.from_user = $1
             OR $1 = ANY(mm.to_users)
           )
         LIMIT 1`,
        [userId, id],
      )
      const allowed = rows && rows.length > 0
      if (!allowed) throw new ForbiddenException('Not permitted')
    }
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: file.s3Key })
    const obj = await this.s3.send(cmd)
    const body = obj.Body as Readable
    const ct = (obj.ContentType as string | undefined) || file.mime || 'application/octet-stream'
    const cl = (obj.ContentLength as number | undefined) || (file.size ? Number(file.size) : undefined)
    res.setHeader('Content-Type', ct)
    if (cl && isFinite(cl)) res.setHeader('Content-Length', String(cl))
    const filename = encodeURIComponent(file.filename || 'download')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return body.pipe(res)
  }

  async confirm(id: string) {
    const file = await this.files.findOne({ where: { id } })
    if (!file) throw new NotFoundException('File not found')
    try {
      if (file.s3Key && file.s3Key.startsWith('uploads-temp/')) {
        const destKey = `uploads/${file.id}-${file.filename}`
        if (destKey !== file.s3Key) {
          await this.s3.send(new CopyObjectCommand({ Bucket: this.bucket, CopySource: `/${this.bucket}/${file.s3Key}`, Key: destKey }))
          try { await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: file.s3Key })) } catch {}
          file.s3Key = destKey
          await this.files.save(file)
        }
      }
    } catch {}
    return file
  }

  async purgeTemp(olderThanHours: number) {
    const cutoff = new Date(Date.now() - Math.max(1, olderThanHours) * 3600 * 1000)
    const rows: Array<{ id: string; s3_key: string }> = await this.files.query(
      `SELECT f.id, f.s3_key
       FROM files f
       LEFT JOIN file_links l ON l.file_id = f.id
       WHERE f.status = $1 AND f.created_at < $2 AND l.file_id IS NULL
       ORDER BY f.id ASC
       LIMIT 500`,
      ['pending', cutoff],
    )
    let deleted = 0
    for (const r of rows) {
      try { await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: r.s3_key })) } catch {}
      try { await this.files.delete({ id: r.id }) ; deleted++ } catch {}
    }
    return { deleted }
  }
}
