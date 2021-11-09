import { UserEntity } from './users/users.entity'
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
import { CurrentUser } from './common/decorators/current-user.decorator'
import { BlogsService } from './blogs/blogs.service'
import { TagsService } from './tags/tags.service'
import { UserDTO } from './users/dtos/user.dto'
import { JwtAuthGuard } from './users/jwt/jwt.guard'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { BlogEntity } from './blogs/blogs.entity'
import { TagEntity } from './tags/tags.entity'
import { UsersService } from './users/users.service'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(
    private readonly blogsService: BlogsService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
  ) {}

  @Render('pages/home')
  @Get()
  @UseGuards(JwtAuthGuard)
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
      title: '윤상석',
      hasPermission,
      blogs: blogs.items.map((blog) => ({
        id: String(blog.id),
        slug: blog.slug,
        createdAt: String(blog.createdAt).split(' ').slice(0, 4).join('.'),
        isPrivate: blog.isPrivate,
        title: blog.title,
        description: blog.description,
      })),
      currentPage: blogs.meta.currentPage,
      totalPage: blogs.meta.totalPages,
      searchKeyword,
      currentTag: tagName,
      tags: tags.map((tag) => ({ ...tag, blogs: tag.blogs.length })),
      emptyMessage: '아무것도 없네요! 😅',
    }
  }

  @Render('pages/profile-detail')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() currentUser: UserDTO | null) {
    let hasPermission = false
    if (currentUser && currentUser.isAdmin) hasPermission = true
    let tags: TagEntity[]
    let user: UserEntity
    try {
      tags = await this.tagsService.findAllTagWithBlog()
      user = await this.usersService.findAdminUser()
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException(error)
    }
    return {
      title: 'amamov | 윤상석',
      hasPermission,
      contents: user?.bio || '',
      tags: tags.map((tag) => ({ ...tag, blogs: tag.blogs.length })),
      emptyMessage: '소개가 작성되지 않았습니다. 🙄',
    }
  }

  @Get('uploads')
  redirectUpload(@Res() res: Response) {
    res.redirect('/blog/uploads')
  }
}
