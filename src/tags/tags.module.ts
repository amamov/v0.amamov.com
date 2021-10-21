import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TagEntity } from './tags.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  providers: [],
  controllers: [],
})
export class TagsModule {}
