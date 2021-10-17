import { Controller, Get, Logger, Param, Render } from '@nestjs/common'

@Controller('blog')
export class BlogsController {
  private logger = new Logger(BlogsController.name)

  //   constructor() {}

  @Get(':slug')
  @Render('pages/blog')
  blog(@Param('slug') slug: string) {
    this.logger.debug(slug)
    return { title: 'amamov | blog' }
  }
}
