import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  ParseIntPipe,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { BlogsService } from './blogs/blogs.service'
import { TagsService } from './tags/tags.service'
import { UserDTO } from './users/dtos/user.dto'
import { JwtAuthGuard } from './users/jwt/jwt.guard'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(
    private readonly blogsService: BlogsService,
    private readonly tagsService: TagsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('pages/home')
  async getHomePage(
    @CurrentUser() currentUser: UserDTO | null,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit = 5,
    @Query('tag') tagName = '',
    @Query('q') searchKeyword = '',
  ) {
    let hasPermission = false
    if (currentUser && currentUser.isAdmin) hasPermission = true

    const [blogs, tags] = await Promise.all([
      this.blogsService.findBlogsWithPaginationAtHomeDomain(
        {
          page,
          limit,
        },
        tagName,
        searchKeyword,
      ),
      this.tagsService.findAllTagWithBlog(),
    ])

    return {
      title: 'amamov | 윤상석',
      hasPermission,
      blogs,
      searchKeyword,
      currentTag: tagName,
      tags: tags.map((tag) => ({ ...tag, blogs: tag.blogs.length })),
    }
  }

  @Get('uploads')
  redirectUpload(@Res() res: Response) {
    res.redirect('/blog/v1/uploads')
  }
}
