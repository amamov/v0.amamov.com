import { Module } from '@nestjs/common'
import { UploadsController } from './uploads.controller'

@Module({
  providers: [],
  controllers: [UploadsController],
})
export class UploadsModule {}
