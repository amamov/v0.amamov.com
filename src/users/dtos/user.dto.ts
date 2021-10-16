import { OmitType } from '@nestjs/swagger'
import { UserEntity } from '../users.entity'

export class UserDto extends OmitType(UserEntity, ['password'] as const) {}
