import { UserDTO } from './users/dtos/user.dto'

declare global {
  namespace Express {
    interface User extends UserDTO {}

    interface Request {
      token?: string
      user?: any
    }
  }
}
