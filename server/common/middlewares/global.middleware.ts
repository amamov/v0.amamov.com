import { Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as expressBasicAuth from 'express-basic-auth'
import * as passport from 'passport'
import * as cookieParser from 'cookie-parser'

export abstract class GlobalMiddlewareSettings {
  protected logger = new Logger(GlobalMiddlewareSettings.name)
  protected DEV_MODE: boolean
  protected PORT: string
  private corsOriginList: string[]
  private ADMIN_USER: string
  private ADMIN_PASSWORD: string

  constructor(protected app: NestExpressApplication) {
    if (!process.env.SECRET_KEY) this.logger.error('Set "SECRET" env')
    this.app = app
    this.DEV_MODE = process.env.NODE_ENV === 'production' ? false : true
    this.PORT = process.env.PORT || '5500'
    this.corsOriginList = process.env.CORS_ORIGIN_LIST
      ? process.env.CORS_ORIGIN_LIST.split(',').map((origin) => origin.trim())
      : ['*']
    this.ADMIN_USER = process.env.ADMIN_USER || 'amamov'
    this.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1205'
  }

  protected setOpenAPIMidleware() {
    this.app.use(
      ['/docs', '/docs-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [this.ADMIN_USER]: this.ADMIN_PASSWORD,
        },
      }),
    )
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

  protected setSessionAndCookieMiddleware() {
    this.app.use(cookieParser())
  }

  protected setPassportMiddleware() {
    this.app.use(passport.initialize())
    this.app.use(passport.session())
  }

  protected setCORSMiddleware() {
    this.app.enableCors({
      origin: this.corsOriginList,
      credentials: true,
    })
  }

  protected setSecurityMiddleware() {
    // TODO
    // TODO this.app.use(csurf)
  }
}
