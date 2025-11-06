import { SetMetadata } from '@nestjs/common'

export const PROJECT_MEMBER_KEY = 'projectMember'
export const ProjectMember = () => SetMetadata(PROJECT_MEMBER_KEY, true)
