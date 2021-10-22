import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Render,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { TagEntity } from './tags.entity'

@Controller('tags')
export class TagsController {
  private logger = new Logger(TagsController.name)

  constructor(
    @InjectRepository(TagEntity)
    private readonly tagsRepository: Repository<TagEntity>,
  ) {}

  // TODO
  @Get()
  @Render('pages/tags')
  async getBlogsWithTag(@Param('name') tagName: string) {
    return
  }
}
