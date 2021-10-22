import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BlogEntity } from './blogs.entity'

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
  ) {}

  async findBlogsWithPagination(limit: number, page: number) {
    const blogs = await this.blogsRepository.find({
      isTemporary: false,
      isPrivate: false,
    })
    console.log(blogs)
    return blogs
  }
}
