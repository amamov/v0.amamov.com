import { CurrentUser } from '@common/decorators/current-user.decorator'
import { OnlyAdminInterceptor } from '@common/interceptors/only-admin.interceptor'
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Render,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { UserDto } from './users/dtos/user.dto'
import { JwtAuthGuard } from './users/jwt/jwt.guard'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('pages/home')
  home(@CurrentUser() currentUser: UserDto | null) {
    let hasPermission = false
    this.logger.debug(currentUser)
    if (currentUser && currentUser.isAdmin) hasPermission = true
    return { title: 'amamov', hasPermission }
  }

  @Get('uploads')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @Render('pages/uploader')
  getUploadPage() {
    return { title: 'amamov | upload' }
  }

  @Get('test')
  @Render('pages/home')
  test() {
    throw new BadRequestException('fuck')
  }
}
