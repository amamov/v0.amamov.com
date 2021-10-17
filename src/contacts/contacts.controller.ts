import { Controller, Get, Logger, Render } from '@nestjs/common'

@Controller('contacts')
export class ContactsController {
  private logger = new Logger(ContactsController.name)

  //   constructor() {}

  @Get()
  @Render('pages/contact')
  contact() {
    return { title: 'amamov | contact' }
  }
}
