import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BlogEntity } from './blogs.entity'
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate'

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
  ): Promise<Pagination<BlogEntity>> {
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
      .leftJoinAndSelect('b.tags', 't')
    if (tagName)
      blogsQueryBuilder.andWhere('t.name = :tagName', { tagName: tagName })
    if (searchKeyword)
      blogsQueryBuilder
        .andWhere('b.title LIKE :title', { title: `%${searchKeyword}%` })
        .orWhere('b.description LIKE :description', {
          description: `%${searchKeyword}%`,
        })
    return paginate<BlogEntity>(blogsQueryBuilder, pagenationOptions)
  }
}
