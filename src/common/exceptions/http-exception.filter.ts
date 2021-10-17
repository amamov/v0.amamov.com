//* REST API에 적용 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status = exception.getStatus()
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string[] }
    if (typeof error === 'string') {
      response
        .status(status)
        .json({ success: true, statusCode: status, message: error })
    } else {
      response.status(status).json({ success: false, ...error })
    }
  }
}
