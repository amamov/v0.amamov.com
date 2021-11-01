import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Redirect,
  Render,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { JwtAuthGuard } from './jwt/jwt.guard'
import { UsersService } from './users.service'
import { UserLogInDTO } from './dtos/user-login.dto'
import { UserDTO } from './dtos/user.dto'
import { UserRegisterDTO } from './dtos/user-register.dto'
import { OnlyAdminInterceptor } from '@common/interceptors/only-admin.interceptor'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from './users.entity'
import { Repository } from 'typeorm'
import { HttpApiExceptionFilter } from '@common/exceptions/http-api-exception.filter'

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  @Post('users')
  @UseFilters(new HttpApiExceptionFilter())
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

  @Get('users/v1/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @Render('pages/user-update')
  async getUserUpdatePage(@CurrentUser() currentUser: UserDTO) {
    return {
      title: 'amamov | profile update',
      initialValue: currentUser.bio || '',
    }
  }

  @Post('users/v1/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @UseFilters(new HttpApiExceptionFilter())
  async updateUserUpdatePage(
    @CurrentUser() currentUser: UserDTO,
    @Body('contents') bio: string,
  ) {
    const user = await this.usersService.findUserById(currentUser.id)
    user.bio = bio
    try {
      await this.usersRepository.save(user)
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException(error)
    }
  }
}
