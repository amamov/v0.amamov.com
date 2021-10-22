import { CurrentUser } from '@common/decorators/current-user.decorator'
import { Controller, Get, Logger, Render, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { BlogsService } from './blogs/blogs.service'
import { UserDTO } from './users/dtos/user.dto'
import { JwtAuthGuard } from './users/jwt/jwt.guard'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('pages/home')
  async getHomePage(@CurrentUser() currentUser: UserDTO | null) {
    let hasPermission = false
    this.logger.debug(currentUser)
    if (currentUser && currentUser.isAdmin) hasPermission = true
    const blogs = await this.blogsService.findBlogsWithPagination(1, 10)
    return { title: 'amamov', hasPermission, blogs }
  }

  @Get('uploads')
  redirectUpload(@Res() res: Response) {
    res.redirect('/blog/v1/uploads')
  }
}
