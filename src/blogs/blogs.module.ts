import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BlogImageEntity } from './blog-images.entity'
import { BlogsController } from './blogs.controller'
import { BlogEntity } from './blogs.entity'

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity, BlogImageEntity])],
  providers: [],
  controllers: [BlogsController],
})
export class BlogsModule {}
