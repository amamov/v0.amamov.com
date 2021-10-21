import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'

@Injectable()
export class NotNullPipe implements PipeTransform {
  transform(data: any, metadata: ArgumentMetadata) {
    if (!data) {
      throw new BadRequestException('충분한 값이 제공되지 않았습니다.')
    }
    return data
  }
}
