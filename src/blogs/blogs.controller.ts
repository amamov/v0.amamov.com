import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
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
import { TagEntity } from 'src/tags/tags.entity'
import { UserDTO } from 'src/users/dtos/user.dto'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import { UsersService } from 'src/users/users.service'
import { Connection, Repository } from 'typeorm'
import { BlogImageEntity } from './blog-images.entity'
import { BlogUploadBodyPipe } from './blog-upload-body.pipe'
import { BlogEntity } from './blogs.entity'
import { BlogUploadDTO } from './dtos/blog-upload.dto'
import { ClientIp } from '@common/decorators/client-real-ip.decorator'
import { VisitorEntity } from 'src/visitors/visitors.entity'

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
    private readonly usersServie: UsersService,
    private readonly awsService: AwsService,
  ) {}

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
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Get('v1/update/:blogSlug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new OnlyAdminInterceptor())
  @Render('pages/uploader')
  async getBlogUpdate(@Param('blogSlug') blogSlug: string) {
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
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  // TODO : VISITOR
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
      throw new BadRequestException(error)
      // throw new NotFoundException(error)
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
    const queryRunner = this.ormConnection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    const author = await this.usersServie.findUserById(currentUser.id)
    try {
      // Typeorm.feature([BlogEntity])의 커넥션으로 연결, 트랜젝션을 위한 queryRunner의 커넥션으로는 연결 안됨
      // const blog = await this.blogsRepository.findOne({ isTemporary: true })
      const blog = await queryRunner.manager
        .getRepository(BlogEntity)
        .findOne({ isTemporary: true })
      blog.isTemporary = false
      if (
        await queryRunner.manager
          .getRepository(BlogEntity)
          .findOne({ title: uploadData.title })
      ) {
        throw new BadRequestException(
          '해당하는 제목의 게시물은 이미 존재합니다.',
        )
      }
      blog.title = uploadData.title
      blog.contents = uploadData.contents
      blog.description = uploadData.description
      blog.isPrivate = uploadData.isPrivate as boolean
      blog.author = author
      // [썸네일 업로드 X]
      // const { key: thumbnail } = await this.awsService.uploadFileToS3(
      //   `blog/${blog.id}`,
      //   thumbnailFile,
      // )
      // blog.thumbnail = thumbnail
      const slug = uploadData.title
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
        .split(' ')
        .filter((w) => w !== '')
        .join('-')
      if (await queryRunner.manager.getRepository(BlogEntity).findOne({ slug }))
        blog.slug = `${slug}-${Math.floor(Math.random() * 1000)}`
      else blog.slug = slug
      const tagList = uploadData.tags
        .replace(/[`~!@$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
        .replace(/ /g, '')
        .split('#')
        .filter((w) => w !== '')
      const tags: TagEntity[] = []
      for (const tagName of tagList) {
        const existedTag = await queryRunner.manager
          .getRepository(TagEntity)
          .findOne({ name: tagName })
        if (existedTag) {
          tags.push(existedTag)
        } else {
          const newTag = queryRunner.manager
            .getRepository(TagEntity)
            .create({ name: tagName })
          tags.push(newTag)
        }
      }
      blog.tags = tags
      await queryRunner.manager.getRepository(BlogEntity).save(blog)
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(error)
    } finally {
      await queryRunner.release()
    }
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
}
