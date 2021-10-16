import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { JwtAuthGuard } from './jwt/jwt.guard'
import { UsersService } from './users.service'
import { UserLogInDto } from './dtos/user-login.dto'
import { UserDto } from './dtos/user.dto'
import { UserRegisterDto } from './dtos/user-register.dto'

@Controller('users')
@ApiTags('USERS : 사용자')
@UseInterceptors(ClassSerializerInterceptor) // https://docs.nestjs.kr/techniques/serialization#exclude-properties
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: UserDto) {
    return user
  }

  @Post()
  async signUp(@Body() body: UserRegisterDto) {
    return this.usersService.registerUser(body)
  }

  @Post('login')
  async logIn(
    @Body() body: UserLogInDto,
    @Res({ passthrough: true }) response: Response, // https://docs.nestjs.kr/controllers#routing
  ) {
    return this.usersService.logIn(body, response)
  }

  @Post('logout')
  async logOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt')
    return {
      success: true,
    }
  }

  // password를 reset하기 위해 email과 토큰을 생성한다.
  // @Post('password/token')
  // async createTokenForResetPassword(@Body('email') email: string) {
  //   return this.usersService.createTokenForResetPassword(email)
  // }
}
