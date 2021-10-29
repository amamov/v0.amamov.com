import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BlogEntity } from './blogs.entity'
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate'

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
  ) {}

  async findBlogsWithPaginationAtHomeDomain(
    pagenationOptions: IPaginationOptions,
    tagName = '',
    searchKeyword = '',
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
