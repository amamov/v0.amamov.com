import { Controller, Get, Logger, Render } from '@nestjs/common'

@Controller('uploads')
export class UploadsController {
  private logger = new Logger(UploadsController.name)

  //   constructor() {}

  @Get()
  @Render('pages/uploader')
  upload() {
    return { title: 'amamov | upload' }
  }
}
