import { Controller, Get, Render } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  @Render('pages/index')
  index() {
    return { title: 'yoon sang seok' }
  }
}
