import { CurrentUser } from '@common/decorators/current-user.decorator'
import { Controller, Get, Logger, Render, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { UserDTO } from './users/dtos/user.dto'
import { JwtAuthGuard } from './users/jwt/jwt.guard'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('pages/home')
  getHomePage(@CurrentUser() currentUser: UserDTO | null) {
    let hasPermission = false
    this.logger.debug(currentUser)
    if (currentUser && currentUser.isAdmin) hasPermission = true
    return { title: 'amamov', hasPermission }
  }

  @Get('uploads')
  redirectUpload(@Res() res: Response) {
    res.redirect('/blog/v1/uploads')
  }
}
