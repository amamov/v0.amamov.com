import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BlogsModule } from 'src/blogs/blogs.module'
import { TagsController } from './tags.controller'
import { TagEntity } from './tags.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([TagEntity]),
    forwardRef(() => BlogsModule),
  ],
  providers: [],
  controllers: [TagsController],
  exports: [TypeOrmModule.forFeature([TagEntity])],
})
export class TagsModule {}
