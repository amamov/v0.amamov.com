import {
  BadRequestException,
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
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { BlogEntity } from './blogs/blogs.entity'
import { TagEntity } from './tags/tags.entity'

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tag') tagName = '',
    @Query('q') searchKeyword = '',
  ) {
    let hasPermission = false
    if (currentUser && currentUser.isAdmin) hasPermission = true
    let blogs: Pagination<BlogEntity, IPaginationMeta>
    let tags: TagEntity[]
    try {
      ;[blogs, tags] = await Promise.all([
        this.blogsService.findBlogsWithPaginationAtHomeDomain(
          {
            page,
            limit,
          },
          tagName,
          searchKeyword,
          hasPermission,
        ),
        this.tagsService.findAllTagWithBlog(),
      ])
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException(error)
    }
    return {
      title: 'amamov | 윤상석',
      hasPermission,
      blogs: blogs.items,
      currentPage: blogs.meta.currentPage,
      totalPage: blogs.meta.totalPages,
      searchKeyword,
      currentTag: tagName,
      tags: tags.map((tag) => ({ ...tag, blogs: tag.blogs.length })),
      emptyMessage: '아무것도 없네요! 😅',
    }
  }

  @Get('uploads')
  redirectUpload(@Res() res: Response) {
    res.redirect('/blog/v1/uploads')
  }

  @Get('favicon.ico')
  getFavicon() {
    return '/static/favicon.ico'
  }
}
