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
import { UserLogInDto } from './dtos/user-login.dto'
import { UserDto } from './dtos/user.dto'
import { UserRegisterDto } from './dtos/user-register.dto'

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async signUp(@Body() body: UserRegisterDto) {
    return this.usersService.registerUser(body)
  }

  @Get('login')
  @UseGuards(JwtAuthGuard)
  @Render('pages/login')
  async getLogIn(
    @CurrentUser() currentUser: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.debug(currentUser)
    if (currentUser) throw new NotFoundException('로그인 완료')
    return { title: 'amamov | login' }
  }

  @Post('login')
  @Redirect('/')
  async logIn(
    @Body() body: UserLogInDto,
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
