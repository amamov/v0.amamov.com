import * as path from 'path'
import { NestFactory, Reflector } from '@nestjs/core'
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as expressBasicAuth from 'express-basic-auth'
import * as passport from 'passport'
import * as cookieParser from 'cookie-parser'
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter'
import { AppModule } from './app.module'

class Applicaition {
  private logger = new Logger(Applicaition.name)
  private DEV_MODE: boolean
  private PORT: string
  private corsOriginList: string[]
  private ADMIN_USER: string
  private ADMIN_PASSWORD: string

  constructor(public app: NestExpressApplication) {
    this.app = app
    if (!process.env.SECRET_KEY) this.logger.error('Set "SECRET" env')
    this.DEV_MODE = process.env.NODE_ENV === 'production' ? false : true
    this.PORT = process.env.PORT || '5500'
    this.corsOriginList = process.env.CORS_ORIGIN_LIST
      ? process.env.CORS_ORIGIN_LIST.split(',').map((origin) => origin.trim())
      : ['*']
    this.ADMIN_USER = process.env.ADMIN_USER || 'amamov'
    this.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1205'
  }

  private setUpBasicAuth() {
    this.app.use(
      ['/docs', '/docs-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [this.ADMIN_USER]: this.ADMIN_PASSWORD,
        },
      }),
    )
  }

  private setUpOpenAPIMidleware() {
    SwaggerModule.setup(
      'docs',
      this.app,
      SwaggerModule.createDocument(
        this.app,
        new DocumentBuilder()
          .setTitle('Yoon Sang Seok - API')
          .setDescription('Yoon Sang Seok Official Web App')
          .setVersion('0.0.1')
          .build(),
      ),
    )
  }

  private setUpMiddleware() {
    this.app.use(cookieParser())
    this.app.enableCors({
      origin: this.corsOriginList,
      credentials: true,
    })
    this.app.use(passport.initialize())
    this.app.use(passport.session())
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    )
    this.app.useGlobalFilters(new HttpExceptionFilter())
    this.app.useGlobalInterceptors(
      new ClassSerializerInterceptor(this.app.get(Reflector)),
    )
    // this.setUpBasicAuth()
    // this.setUpOpenAPIMidleware()
    this.app.useStaticAssets(path.join(__dirname, '..', 'public'), {
      prefix: '/static/',
    })
    this.app.useStaticAssets(
      path.join(__dirname, '..', 'public', '/robots.txt'),
      {
        prefix: '/robots.txt',
      },
    )
    this.app.useStaticAssets(
      path.join(__dirname, '..', 'public', '/favicon.ico'),
      {
        prefix: '/favicon.ico',
      },
    )
    this.app.setBaseViewsDir(path.join(__dirname, '..', 'views'))
    this.app.setViewEngine('pug')
  }

  public async boostrap() {
    this.setUpMiddleware()
    await this.app.listen(this.PORT)
  }

  public startLog() {
    if (this.DEV_MODE) {
      this.logger.log(`✅ Server on http://localhost:${this.PORT}`)
    } else {
      this.logger.log(`✅ Server on port ${this.PORT}...`)
    }
  }

  public errorLog(error: string) {
    this.logger.error(`🆘 Server error ${error}`)
  }
}

async function init() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const server = new Applicaition(app)
  try {
    await server.boostrap()
    server.startLog()
  } catch (error) {
    server.errorLog(error.message)
  }
}

init().catch((error) => {
  new Logger('init').error(error)
})
