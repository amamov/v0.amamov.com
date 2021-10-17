import { Module } from '@nestjs/common'
import { BlogsController } from './blogs.controller'

@Module({
  providers: [],
  controllers: [BlogsController],
})
export class BlogsModule {}
