import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { OrgUnit } from '../entities/org-unit.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(OrgUnit) private readonly orgs: Repository<OrgUnit>,
  ) {}

  async me(userId: string) {
    const me = await this.users.findOne({ where: { id: userId }, relations: { orgUnit: true } })
    if (!me) throw new NotFoundException('User not found')
    return me
  }

  async updateMe(userId: string, dto: Partial<Pick<User, 'displayName' | 'phoneExt'>>) {
    const me = await this.users.findOne({ where: { id: userId } })
    if (!me) throw new NotFoundException('User not found')
    if (dto.displayName !== undefined) me.displayName = dto.displayName
    if (dto.phoneExt !== undefined) me.phoneExt = dto.phoneExt
    return this.users.save(me)
  }

  async setPresence(userId: string, presence: User['presence']) {
    const me = await this.users.findOne({ where: { id: userId } })
    if (!me) throw new NotFoundException('User not found')
    me.presence = presence
    return this.users.save(me)
  }

  async moveUser(userId: string, orgUnitId: string) {
    const me = await this.users.findOne({ where: { id: userId } })
    if (!me) throw new NotFoundException('User not found')
    const org = await this.orgs.findOne({ where: { id: orgUnitId } })
    if (!org) throw new NotFoundException('Org unit not found')
    me.orgUnit = org
    return this.users.save(me)
  }
}
