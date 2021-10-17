import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // const status = exception.getStatus()
    // const error = exception.getResponse() as
    //   | string
    //   | { error: string; statusCode: number; message: string[] }
    response.redirect('/')
  }
}
