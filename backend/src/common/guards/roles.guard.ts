import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY, AppRole } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required || required.length === 0) return true

    const req = context.switchToHttp().getRequest<any>()
    // Access token carries adm:boolean for admin role
    const isAdmin = !!req.user?.adm
    if (required.includes('admin')) return isAdmin

    // For future roles
    return true
  }
}
