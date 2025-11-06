import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectMember as ProjectMemberEntity } from '../../entities/project-member.entity'
import { PROJECT_MEMBER_KEY } from '../decorators/project-member.decorator'

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ProjectMemberEntity)
    private readonly members: Repository<ProjectMemberEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresMembership = this.reflector.getAllAndOverride<boolean>(PROJECT_MEMBER_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiresMembership) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const projectId = request.params.projectId || request.body?.projectId

    if (!user || !projectId) {
      throw new ForbiddenException('Project membership required')
    }

    const membership = await this.members.findOne({
      where: { userId: user.userId, projectId },
    })

    if (!membership) {
      throw new ForbiddenException('You are not a member of this project')
    }

    // Attach membership info to request for later use
    request.projectMember = membership

    return true
  }
}
