import { BadRequestException, Controller, Get, Render } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  @Render('pages/home')
  home() {
    return { title: 'yoon sang seok' }
  }

  @Get('test')
  @Render('pages/home')
  test() {
    throw new BadRequestException('fuck')
  }
}
