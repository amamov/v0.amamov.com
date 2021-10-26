import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Redirect,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { JwtAuthGuard } from './jwt/jwt.guard'
import { UsersService } from './users.service'
import { UserLogInDTO } from './dtos/user-login.dto'
import { UserDTO } from './dtos/user.dto'
import { UserRegisterDTO } from './dtos/user-register.dto'

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async signUp(@Body() body: UserRegisterDTO) {
    return this.usersService.registerUser(body)
  }

  @Get('login')
  @UseGuards(JwtAuthGuard)
  @Render('pages/login')
  async getLogIn(
    @CurrentUser() currentUser: UserDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (currentUser) throw new NotFoundException('로그인 완료')
    return { title: 'amamov | login' }
  }

  @Post('login')
  @Redirect('/')
  async logIn(
    @Body() body: UserLogInDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.usersService.logIn(body, response)
  }

  @Get('logout')
  @Redirect('/')
  async logOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt')
  }
}
