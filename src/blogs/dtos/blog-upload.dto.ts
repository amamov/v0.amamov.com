import { PickType } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { BlogEntity } from '../blogs.entity'

export class BlogUploadDTO extends PickType(BlogEntity, [
  'title',
  'description',
  'contents',
] as const) {
  @IsString()
  @IsNotEmpty()
  tags: string

  @IsNotEmpty()
  isPrivate: 'false' | 'true' | boolean
}
