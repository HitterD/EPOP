import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { OrgUnit } from '../entities/org-unit.entity'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { DirectoryAudit } from '../entities/directory-audit.entity'
import { OutboxService } from '../events/outbox.service'
import { parse } from 'csv-parse/sync'

@Injectable()
export class DirectoryService {
  constructor(
    @InjectRepository(OrgUnit) private readonly orgs: Repository<OrgUnit>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(DirectoryAudit) private readonly audits: Repository<DirectoryAudit>,
    private readonly outbox: OutboxService,
  ) {}

  async tree() {
    const rows = await this.orgs.query(`
      WITH RECURSIVE tree AS (
        SELECT id, parent_id, name, 0 AS depth, ARRAY[id] AS path
        FROM org_units WHERE parent_id IS NULL
        UNION ALL
        SELECT o.id, o.parent_id, o.name, t.depth+1, t.path||o.id
        FROM org_units o JOIN tree t ON o.parent_id = t.id
      )
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id, 'name', name,
          'children', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object('id', c.id, 'name', c.name)
            ), '[]'::jsonb)
            FROM org_units c WHERE c.parent_id = tree.id
          )
        ) ORDER BY path
      ) AS org_tree
      FROM tree WHERE depth = 0;
    `)
    const orgTree = rows?.[0]?.org_tree ?? []
    return { orgTree }
  }

  // Import helpers
  private parseOrgCsv(buffer?: Buffer) {
    if (!buffer || buffer.length === 0) throw new BadRequestException('Missing CSV data')
    let rows: any[] = []
    try {
      const content = buffer.toString('utf8')
      rows = parse(content, { bom: true, columns: true, skip_empty_lines: true, trim: true })
    } catch {
      throw new BadRequestException('Invalid CSV')
    }
    const norm = (v: any) => String(v ?? '').trim()
    const toLower = (v: any) => norm(v).toLowerCase()
    const out = rows.map((r) => {
      const obj: Record<string, any> = {}
      for (const k of Object.keys(r)) obj[toLower(k)] = r[k]
      return {
        code: norm(obj['code'] ?? obj['org_unit_code']),
        name: norm(obj['name'] ?? obj['org_unit_name']),
        parentCode: norm(obj['parent_code'] ?? obj['parent']),
      }
    }).filter((r) => r.code || r.name)
    return out
  }

  async importDryRun(buffer?: Buffer) {
    const rows = this.parseOrgCsv(buffer)
    return { count: rows.length, preview: rows.slice(0, 50) }
  }

  async importCommit(buffer?: Buffer) {
    const rows = this.parseOrgCsv(buffer)
    if (!rows.length) return { imported: 0 }
    let imported = 0
    await this.orgs.manager.transaction(async (manager) => {
      const orgRepo = manager.getRepository(OrgUnit)
      const auditRepo = manager.getRepository(DirectoryAudit)
      // Map codes to entities
      const byCode = new Map<string, OrgUnit>()
      // First pass (batched): ensure all units exist
      const codes = Array.from(new Set(rows.map((r) => r.code).filter(Boolean))) as string[]
      if (codes.length) {
        const existing = await orgRepo.find({ where: { code: codes as any } as any })
        for (const e of existing) byCode.set(String(e.code), e)

        const toCreate: OrgUnit[] = []
        for (const r of rows) {
          if (!r.code) continue
          if (!byCode.has(r.code)) {
            const entity = orgRepo.create({ code: r.code, name: r.name || r.code })
            toCreate.push(entity)
          }
        }
        if (toCreate.length) {
          const created = await orgRepo.save(toCreate)
          imported += created.length
          await auditRepo.save(
            created.map((org) => auditRepo.create({ action: 'unit_created', actorId: '0', targetId: org.id, fromParentId: null, toParentId: null, details: null }))
          )
          for (const c of created) byCode.set(String(c.code), c)
        }

        const toUpdate: OrgUnit[] = []
        for (const r of rows) {
          if (!r.code || !r.name) continue
          const org = byCode.get(r.code)
          if (org && org.name !== r.name) {
            org.name = r.name
            toUpdate.push(org)
          }
        }
        if (toUpdate.length) {
          const updated = await orgRepo.save(toUpdate)
          await auditRepo.save(
            updated.map((org) => auditRepo.create({ action: 'unit_updated', actorId: '0', targetId: org.id, fromParentId: null, toParentId: null, details: { name: org.name } }))
          )
          for (const u of updated) byCode.set(String(u.code), u)
        }
      }
      // Second pass: set parents
      for (const r of rows) {
        if (!r.code) continue
        const org = byCode.get(r.code)!
        const fromParentId = org.parent ? org.parent.id : null
        const parent = r.parentCode ? byCode.get(r.parentCode) : null
        const toParentId = parent ? parent.id : null
        const changed = (fromParentId || null) !== (toParentId || null)
        if (changed) {
          org.parent = parent ?? null
          await orgRepo.save(org)
          await auditRepo.save(auditRepo.create({ action: 'unit_moved', actorId: '0', targetId: org.id, fromParentId, toParentId, details: null }))
        }
      }
    })
    return { imported }
  }

  async create(dto: { name: string; code?: string | null; parentId?: string | null }) {
    const entity = this.orgs.create({ name: dto.name, code: dto.code ?? null })
    if (dto.parentId) {
      const parent = await this.orgs.findOne({ where: { id: dto.parentId } })
      if (!parent) throw new NotFoundException('Parent not found')
      entity.parent = parent
    }
    return this.orgs.save(entity)
  }

  async update(id: string, dto: { name?: string; code?: string | null }) {
    const org = await this.orgs.findOne({ where: { id } })
    if (!org) throw new NotFoundException('Org unit not found')
    if (dto.name !== undefined) org.name = dto.name
    if (dto.code !== undefined) org.code = dto.code
    return this.orgs.save(org)
  }

  async remove(id: string) {
    const org = await this.orgs.findOne({ where: { id } })
    if (!org) throw new NotFoundException('Org unit not found')
    return this.orgs.remove(org)
  }

  async move(actorId: string, id: string, newParentId: string | null) {
    if (id === newParentId) throw new BadRequestException('Cannot move into itself')
    return this.orgs.manager.transaction(async (manager) => {
      const orgRepo = manager.getRepository(OrgUnit)
      const auditRepo = manager.getRepository(DirectoryAudit)
      const org = await orgRepo.findOne({ where: { id }, relations: { parent: true } })
      if (!org) throw new NotFoundException('Org unit not found')
      const fromParentId = org.parent ? org.parent.id : null
      let toParentId: string | null = null
      if (newParentId) {
        const parent = await orgRepo.findOne({ where: { id: newParentId } })
        if (!parent) throw new NotFoundException('Parent not found')
        org.parent = parent as any
        toParentId = parent.id
      } else {
        org.parent = null as any
        toParentId = null
      }
      await orgRepo.save(org)
      await auditRepo.save(auditRepo.create({
        action: 'unit_moved',
        actorId,
        targetId: id,
        fromParentId,
        toParentId,
        details: null,
      }))
      await this.outbox.appendWithManager(manager, {
        name: 'directory.unit.moved',
        aggregateType: 'org',
        aggregateId: id,
        userId: actorId,
        id: undefined as any,
        timestamp: undefined as any,
        payload: { orgId: id, fromParentId, toParentId },
      })
      return { success: true }
    })
  }

  async usersInOrg(orgId: string) {
    return this.users.query(
      `SELECT u.id, u.display_name, u.email, u.phone_ext, u.presence
       FROM users u
       JOIN org_units o ON o.id = u.org_unit_id
       WHERE o.id = $1
       ORDER BY u.display_name;`,
      [orgId],
    )
  }

  async moveUserToOrg(actorId: string, userId: string, orgId: string) {
    return this.users.manager.transaction(async (manager) => {
      const userRepo = manager.getRepository(User)
      const orgRepo = manager.getRepository(OrgUnit)
      const auditRepo = manager.getRepository(DirectoryAudit)
      const user = await userRepo.findOne({ where: { id: userId }, relations: { orgUnit: true } })
      if (!user) throw new NotFoundException('User not found')
      const org = await orgRepo.findOne({ where: { id: orgId } })
      if (!org) throw new NotFoundException('Org unit not found')
      const fromParentId = user.orgUnit ? user.orgUnit.id : null
      user.orgUnit = org
      await userRepo.save(user)
      await auditRepo.save(auditRepo.create({
        action: 'user_moved',
        actorId,
        targetId: userId,
        fromParentId,
        toParentId: org.id,
        details: null,
      }))
      await this.outbox.appendWithManager(manager, {
        name: 'directory.user.moved',
        aggregateType: 'user',
        aggregateId: userId,
        userId: actorId,
        id: undefined as any,
        timestamp: undefined as any,
        payload: { userId, fromOrgId: fromParentId, toOrgId: org.id },
      })
      return { success: true }
    })
  }
}
