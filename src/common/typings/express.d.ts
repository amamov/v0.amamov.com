import { UserDto } from 'src/users/dtos/user.dto'

declare global {
  namespace Express {
    interface User extends UserDto {}

    interface Request {
      token?: string
    }
  }
}
