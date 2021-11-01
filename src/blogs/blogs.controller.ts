import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Render,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { InjectRepository } from '@nestjs/typeorm'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { HttpApiExceptionFilter } from '@common/exceptions/http-api-exception.filter'
import { OnlyAdminInterceptor } from '@common/interceptors/only-admin.interceptor'
import { AwsService } from '@common/services/aws.service'
import { UserDTO } from 'src/users/dtos/user.dto'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import { BlogImageEntity } from './blog-images.entity'
import { BlogUploadBodyPipe } from './blog-upload-body.pipe'
import { BlogEntity } from './blogs.entity'
import { BlogUploadDTO } from './dtos/blog-upload.dto'
import { ClientIp } from '@common/decorators/client-real-ip.decorator'
import { VisitorEntity } from 'src/visitors/visitors.entity'
import { BlogsService } from './blogs.service'
import { Connection, Repository } from 'typeorm'
import { TagEntity } from 'src/tags/tags.entity'

@Controller('blog')
export class BlogsController {
  private logger = new Logger(BlogsController.name)

  constructor(
    private readonly ormConnection: Connection,
    @InjectRepository(VisitorEntity)
    private readonly visitorsRepository: Repository<VisitorEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    @InjectRepository(BlogImageEntity)
    private readonly blogImagesRepository: Repository<BlogImageEntity>,
    @InjectRepository(TagEntity)
    private readonly tagsRepository: Repository<TagEntity>,
    private readonly blogsService: BlogsService,
    private readonly awsService: AwsService,
  ) {}

  @Get('v1/update/:blogSlug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @Render('pages/blog-update')
  async getBlogUpdate(@Param('blogSlug') blogSlug: string) {
    try {
      const blog = await this.blogsRepository
        .createQueryBuilder('b')
        .where('b.slug = :slug', { slug: blogSlug })
        .leftJoinAndSelect('b.tags', 't')
        .getOne()

      const tags = blog.tags
        ? '#' + blog.tags.map((tag) => tag.name).join(' #')
        : ''

      return {
        title: 'amamov | update',
        blogId: blog.id,
        blogTitle: blog.title,
        description: blog.description,
        isPrivate: blog.isPrivate,
        tags,
        blogInitialContents: blog.contents,
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Get('v1/uploads')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @Render('pages/uploader')
  async getBlogUploadPage() {
    const context = { title: 'amamov | upload', blogId: '' }
    try {
      const existedBlog = await this.blogsRepository.findOne(
        {
          isTemporary: true,
        },
        { relations: ['images'] },
      )
      if (existedBlog) {
        context.blogId = existedBlog.id
        if (existedBlog.images.length > 0) {
          existedBlog.images.forEach(async (imageEntity) => {
            await Promise.all([
              this.blogImagesRepository.delete(imageEntity.id),
              this.awsService.deleteS3Object(imageEntity.image),
            ])
          })
        }
      } else {
        const blog = this.blogsRepository.create({
          isTemporary: true,
          isPrivate: true,
        })
        await this.blogsRepository.save(blog)
        context.blogId = blog.id
      }
      return context
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Get(':slug')
  @Render('pages/blog')
  @UseGuards(JwtAuthGuard)
  async getBlogDetailPage(
    @CurrentUser() currentUser: UserDTO | null,
    @ClientIp() visitorIp: string,
    @Param('slug') slug: string,
  ) {
    let hasPermission = false
    if (currentUser && currentUser.isAdmin) hasPermission = true
    try {
      let blog: BlogEntity
      if (hasPermission)
        blog = await this.blogsRepository.findOne(
          { slug, isTemporary: false },
          { relations: ['tags'] },
        )
      else
        blog = await this.blogsRepository.findOne(
          { slug, isTemporary: false, isPrivate: false },
          { relations: ['tags'] },
        )
      if (!blog) throw new Error('해당하는 로그를 찾을 수 없습니다.')
      const visitor = this.visitorsRepository.create({ blog, ip: visitorIp })
      await this.visitorsRepository.save(visitor)
      return {
        title: blog.title,
        hasPermission,
        slug: blog.slug,
        contents: blog.contents,
        blogTitle: blog.title,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        isPrivate: blog.isPrivate,
        tags: blog.tags.map((tag) => tag.name),
      }
    } catch (error) {
      // throw new BadRequestException(error)
      throw new NotFoundException(error)
    }
  }

  //************************ API ************************//

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @UseFilters(new HttpApiExceptionFilter())
  async uploadBlog(
    @CurrentUser() currentUser: UserDTO,
    @Body(new BlogUploadBodyPipe()) uploadData: BlogUploadDTO,
  ): Promise<void> {
    return await this.blogsService.uploadBlogPoster(
      currentUser.id,
      { isTemporary: true },
      uploadData,
    )
  }

  @Delete(':blogId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @UseFilters(new HttpApiExceptionFilter())
  async deleteBlog(@Param('blogId') blogId: string): Promise<void> {
    const queryRunner = this.ormConnection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const blog = await queryRunner.manager
        .getRepository(BlogEntity)
        .createQueryBuilder('b')
        .where('b.id = :id', { id: blogId })
        .leftJoinAndSelect('b.tags', 't')
        .getOne()
      let tags = blog.tags
      await queryRunner.manager.getRepository(BlogEntity).delete(blogId)
      tags = await Promise.all(
        tags.map(async (tag) => {
          const _tag = await queryRunner.manager
            .getRepository(TagEntity)
            .createQueryBuilder('t')
            .where('t.id = :id', { id: tag.id })
            .leftJoinAndSelect('t.blogs', 'tb')
            .getOne()
          if (_tag.blogs.length === 0) return _tag
        }),
      )
      tags = tags.filter((tag) => tag !== undefined)
      if (tags.length !== 0) {
        await Promise.all(
          tags.map(
            async (tag) =>
              await queryRunner.manager.getRepository(TagEntity).delete(tag.id),
          ),
        )
      }
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(error)
    } finally {
      await queryRunner.release()
    }
  }

  @Post('update/:blogId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @UseFilters(new HttpApiExceptionFilter())
  async updateBlog(
    @CurrentUser() currentUser: UserDTO,
    @Body(new BlogUploadBodyPipe()) uploadData: BlogUploadDTO,
    @Param('blogId') blogId: string,
  ): Promise<void> {
    return await this.blogsService.uploadBlogPoster(
      currentUser.id,
      { id: blogId },
      uploadData,
      { isNew: false, updateBlogId: blogId },
    )
  }

  @Post('v1/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor(), FileInterceptor('image'))
  @UseFilters(new HttpApiExceptionFilter())
  async uploadBlogPostImage(@UploadedFile() imageFile: Express.Multer.File) {
    try {
      const currentBlog = await this.blogsRepository.findOne({
        isTemporary: true,
      })
      const { key: image } = await this.awsService.uploadFileToS3(
        `blog/${currentBlog.id}`,
        imageFile,
      )
      const blogImage = this.blogImagesRepository.create({
        blog: currentBlog,
        image,
      })
      await this.blogImagesRepository.save(blogImage)
      return { image: this.awsService.getAwsS3FileUrl(blogImage.image) }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Patch('private/:blogSlug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @UseFilters(new HttpApiExceptionFilter())
  async togglePrivate(@Param('blogSlug') blogSlug: string) {
    try {
      const blog = await this.blogsRepository.findOne({ slug: blogSlug })
      blog.isPrivate = !blog.isPrivate
      await this.blogsRepository.save(blog)
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @UseFilters(new HttpApiExceptionFilter())
  async saveBlog(
    @CurrentUser() currentUser: UserDTO,
    @Body(new BlogUploadBodyPipe()) uploadData: BlogUploadDTO,
  ): Promise<void> {
    try {
      this.logger.debug('save')
    } catch (error) {
      throw new BadRequestException(error)
    }
  }
}
