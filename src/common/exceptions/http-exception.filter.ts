import {
  ArgumentsHost,
  HttpException,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string[] }
    this.logger.error(error)
    if (status === 404) response.redirect('/')
    else if (status === 403) response.redirect('/login')
    else if (status === 400 || status === 401) {
      if (typeof error === 'string')
        response.render('pages/400', { message: error })
      else response.render('pages/400', error)
    } else
      response.render('pages/400', { message: '서버에 문제가 발생했습니다.' })
  }
}
