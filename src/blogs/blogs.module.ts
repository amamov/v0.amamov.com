import { AwsService } from '@common/services/aws.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TagsModule } from 'src/tags/tags.module'
import { UsersModule } from 'src/users/users.module'
import { BlogImageEntity } from './blog-images.entity'
import { BlogsController } from './blogs.controller'
import { BlogEntity } from './blogs.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity, BlogImageEntity]),
    UsersModule,
    TagsModule,
  ],
  providers: [AwsService],
  controllers: [BlogsController],
})
export class BlogsModule {}
