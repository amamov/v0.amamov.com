import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { GlobalMiddlewareSettings } from '@common/middlewares/global.middleware'
import { AppModule } from './app.module'
import * as path from 'path'
import { NotFoundExceptionFilter } from '@common/exceptions/not-found-exception.filter'

class Server extends GlobalMiddlewareSettings {
  constructor(protected app: NestExpressApplication) {
    super(app)
  }

  private setGlobalMiddleware() {
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    )

    this.setSessionAndCookieMiddleware()
    this.setCORSMiddleware()
    this.setPassportMiddleware()
    // this.app.useGlobalFilters(new NotFoundExceptionFilter())
    this.app.useGlobalFilters(new NotFoundExceptionFilter())
    this.app.useStaticAssets(path.join(__dirname, '..', 'public'), {
      prefix: '/static/',
    })
    this.app.setBaseViewsDir(path.join(__dirname, '..', 'views'))
    this.app.setViewEngine('pug')
    this.setOpenAPIMidleware()
  }

  async boostrap() {
    this.setGlobalMiddleware()
    await this.app.listen(this.PORT)
  }

  startLog() {
    if (this.DEV_MODE) {
      this.logger.log(`✅ Server on http://localhost:${this.PORT}`)
    } else {
      this.logger.log(`✅ Server on port ${this.PORT}...`)
    }
  }

  errorLog(error: string) {
    this.logger.error(`🆘 Server error ${error}`)
  }
}

async function init() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const server = new Server(app)
  try {
    await server.boostrap()
    server.startLog()
  } catch (error) {
    server.errorLog(error.message)
  }
}

init()
