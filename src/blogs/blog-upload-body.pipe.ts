import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'
import { BlogUploadDTO } from './dtos/blog-upload.dto'

@Injectable()
export class BlogUploadBodyPipe implements PipeTransform {
  transform(data: BlogUploadDTO, metadata: ArgumentMetadata) {
    if (data.isPrivate === 'false') data.isPrivate = false
    else if (data.isPrivate === 'true') data.isPrivate = true
    else if (typeof data.isPrivate !== 'boolean') {
      throw new BadRequestException('잘못된 요청입니다.')
    }
    return data
  }
}
