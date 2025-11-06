import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { OrgUnit } from '../entities/org-unit.entity'
import { Message } from '../entities/message.entity'
import { FileEntity } from '../entities/file.entity'
import * as argon2 from 'argon2'
import { parse } from 'csv-parse/sync'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(OrgUnit) private readonly orgs: Repository<OrgUnit>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(FileEntity) private readonly files: Repository<FileEntity>,
  ) {}

  async bulkImportUsersFromCSV(buffer: Buffer) {
    if (!buffer || buffer.length === 0) throw new BadRequestException('Missing CSV data')
    let records: any[] = []
    try {
      const content = buffer.toString('utf8')
      records = parse(content, {
        bom: true,
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      }) as any[]
    } catch (e) {
      throw new BadRequestException('Invalid CSV format')
    }

    const norm = (v: any) => String(v ?? '').trim()
    const toLower = (v: any) => norm(v).toLowerCase()

    let imported = 0
    for (const rec of records) {
      if (!rec) continue
      const obj: Record<string, any> = {}
      for (const k of Object.keys(rec)) obj[toLower(k)] = rec[k]

      const email = toLower(obj['username'] ?? obj['email'])
      if (!email) continue
      const name = norm(obj['name']) || email
      const pass = norm(obj['password']) || Math.random().toString(36).slice(2)
      const ext = obj['extension'] ? norm(obj['extension']) : null
      const role = toLower(obj['role'])
      const orgCode = obj['org_unit_code'] ? norm(obj['org_unit_code']) : null

      let org: OrgUnit | null = null
      if (orgCode) {
        org = await this.orgs.findOne({ where: { code: orgCode } })
        if (!org) org = await this.orgs.save(this.orgs.create({ name: orgCode, code: orgCode }))
      }

      let user = await this.users.findOne({ where: { email } })
      const passwordHash = await argon2.hash(pass)
      if (!user) {
        user = this.users.create({ email, displayName: name, passwordHash, phoneExt: ext, isAdmin: role === 'admin', orgUnit: org ?? undefined })
      } else {
        user.displayName = name
        user.phoneExt = ext
        user.isAdmin = role === 'admin'
        user.orgUnit = org ?? null
        user.passwordHash = passwordHash
      }
      await this.users.save(user)
      imported++
    }
    return { imported }
  }

  async analyticsSummary() {
    const messagesPerDay = await this.messages.query(`
      SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
      FROM messages
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY day ORDER BY day
    `)
    const activeUsers = await this.users.query(`
      SELECT COUNT(*)::int AS count FROM users WHERE presence <> 'offline'
    `)
    const storage = await this.files.query(`
      SELECT COALESCE(SUM(size::bigint),0)::bigint AS bytes FROM files
    `)
    return {
      messagesPerDay,
      activeUsers: activeUsers?.[0]?.count ?? 0,
      storageBytes: storage?.[0]?.bytes ?? 0,
    }
  }
}
