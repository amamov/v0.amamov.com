import { Module } from '@nestjs/common'
import { ContactsController } from './contacts.controller'

@Module({
  providers: [],
  controllers: [ContactsController],
})
export class ContactsModule {}
