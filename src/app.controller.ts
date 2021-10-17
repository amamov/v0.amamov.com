import { Controller, Get, Render } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  @Render('pages/home')
  home() {
    return { title: 'yoon sang seok' }
  }
}
