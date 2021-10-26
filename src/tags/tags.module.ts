import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BlogsModule } from 'src/blogs/blogs.module'
import { TagsController } from './tags.controller'
import { TagEntity } from './tags.entity'
import { TagsService } from './tags.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([TagEntity]),
    forwardRef(() => BlogsModule),
  ],
  providers: [TagsService],
  controllers: [TagsController],
  exports: [TypeOrmModule.forFeature([TagEntity]), TagsService],
})
export class TagsModule {}
