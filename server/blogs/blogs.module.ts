import { AwsService } from '../common/services/aws.service'
import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TagsModule } from '../tags/tags.module'
import { UsersModule } from '../users/users.module'
import { VisitorsModule } from '../visitors/visitors.module'
import { BlogImageEntity } from './blog-images.entity'
import { BlogsController } from './blogs.controller'
import { BlogEntity } from './blogs.entity'
import { BlogsService } from './blogs.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity, BlogImageEntity]),
    UsersModule,
    VisitorsModule,
    forwardRef(() => TagsModule),
  ],
  providers: [AwsService, BlogsService],
  controllers: [BlogsController],
  exports: [TypeOrmModule.forFeature([BlogEntity]), BlogsService],
})
export class BlogsModule {}
