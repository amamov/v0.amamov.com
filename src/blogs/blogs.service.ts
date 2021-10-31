import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, FindConditions, Repository } from 'typeorm'
import { BlogEntity } from './blogs.entity'
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate'
import { UsersService } from 'src/users/users.service'
import { BlogUploadDTO } from './dtos/blog-upload.dto'
import { TagEntity } from 'src/tags/tags.entity'

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    private readonly ormConnection: Connection,
    private readonly usersServie: UsersService,
  ) {}

  async uploadBlogPoster(
    authorId: string,
    findConditions: FindConditions<BlogEntity>,
    uploadData: BlogUploadDTO,
    updateOption?: {
      isNew: boolean
      updateBlogId: string
    },
  ) {
    let isNew = true
    if (updateOption && !updateOption.isNew) {
      isNew = false
    }
    const queryRunner = this.ormConnection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    const author = await this.usersServie.findUserById(authorId)
    try {
      // Typeorm.feature([BlogEntity])의 커넥션으로 연결, 트랜젝션을 위한 queryRunner의 커넥션으로는 연결 안됨
      // const blog = await this.blogsRepository.findOne({ isTemporary: true })
      const blog = await queryRunner.manager
        .getRepository(BlogEntity)
        .findOne(findConditions)
      if (
        isNew &&
        (await queryRunner.manager
          .getRepository(BlogEntity)
          .findOne({ title: uploadData.title }))
      ) {
        throw new BadRequestException(
          '해당하는 제목의 게시물은 이미 존재합니다.',
        )
      }
      blog.isTemporary = false
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

      const checkedBlogForSlug = await queryRunner.manager
        .getRepository(BlogEntity)
        .findOne({ slug })
      if (isNew) {
        if (checkedBlogForSlug)
          blog.slug = `${slug}-${Math.floor(Math.random() * 1000)}`
        else blog.slug = slug
      } else {
        if (
          checkedBlogForSlug &&
          checkedBlogForSlug.id !== updateOption.updateBlogId
        )
          blog.slug = `${slug}-${Math.floor(Math.random() * 1000)}`
        else blog.slug = slug
      }
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

  async findBlogsWithPaginationAtHomeDomain(
    pagenationOptions: IPaginationOptions,
    tagName = '',
    searchKeyword = '',
    hasPermission = false,
  ) {
    let { limit, page } = pagenationOptions
    limit = limit > 10 ? 10 : Number(limit)
    page = page < 1 ? 1 : Number(page)
    const blogsQueryBuilder = this.blogsRepository
      .createQueryBuilder('b')
      .where('b.isTemporary = false')
      .select([
        'b.title',
        'b.description',
        'b.createdAt',
        'b.updatedAt',
        'b.isPrivate',
        'b.slug',
      ])
    // .leftJoinAndSelect('b.tags', 't') // issue : #13
    // .offset((page - 1) * limit)
    // .limit(limit)

    if (!hasPermission) blogsQueryBuilder.andWhere('b.isPrivate = false')

    if (tagName)
      blogsQueryBuilder.leftJoin('b.tags', 't').andWhere('t.name = :tagName', {
        tagName: tagName,
      }) // issue : #13
    if (searchKeyword)
      blogsQueryBuilder
        .andWhere('b.title LIKE :title', { title: `%${searchKeyword}%` })
        .orWhere('b.description LIKE :description', {
          description: `%${searchKeyword}%`,
        })

    return await paginate<BlogEntity>(blogsQueryBuilder, {
      ...pagenationOptions,
      limit,
      page,
    })

    // return {
    //   items: await blogsQueryBuilder.getMany(),
    //   meta: {
    //     currentPage: page,
    //     totalPages: ...,
    //   },
    // }
  }
}
