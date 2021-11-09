import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BlogsModule } from '../blogs/blogs.module'
import { TagEntity } from './tags.entity'
import { TagsService } from './tags.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([TagEntity]),
    forwardRef(() => BlogsModule),
  ],
  providers: [TagsService],
  exports: [TypeOrmModule.forFeature([TagEntity]), TagsService],
})
export class TagsModule {}
