import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VisitorEntity } from './visitors.entity'

@Module({
  imports: [TypeOrmModule.forFeature([VisitorEntity])],
  exports: [TypeOrmModule.forFeature([VisitorEntity])],
})
export class VisitorsModule {}
