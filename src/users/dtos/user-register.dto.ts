import { PickType } from '@nestjs/swagger'
import { UserEntity } from '../users.entity'

export class UserRegisterDto extends PickType(UserEntity, [
  'email',
  'username',
  'password',
] as const) {}
