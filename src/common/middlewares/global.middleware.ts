import { Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as expressBasicAuth from 'express-basic-auth'
import * as passport from 'passport'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'

export abstract class GlobalMiddlewareSettings {
  protected logger = new Logger(GlobalMiddlewareSettings.name)
  protected DEV_MODE: boolean
  protected PORT: string
  private corsOriginList: string[]
  private COOKIE_SECRET: string
  private ADMIN_USER: string
  private ADMIN_PASSWORD: string

  constructor(protected app: NestExpressApplication) {
    if (!process.env.SECRET_KEY) this.logger.error('Set "SECRET" env')
    this.app = app
    this.COOKIE_SECRET = process.env.SECRET_KEY || ''
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
    let sessionOptions: session.SessionOptions = {
      resave: false,
      saveUninitialized: false,
      secret: this.COOKIE_SECRET,
      cookie: {
        httpOnly: true,
      },
    }
    try {
      // TODO redis session store 연결
      //   sessionOptions.store = new RedisStore({
      //     client: redis,
      //     host: 'localhost',
      //     port: 6379,
      //     prefix: 'session:',
      //     db: 0,
      //     saveUninitialized: false,
      //     resave: false,
      //   });
    } catch (error) {
      this.logger.error(error)
    }
    if (!this.DEV_MODE) {
      //* in production
      sessionOptions = { ...sessionOptions /* append production option */ }
    }
    this.app.use(cookieParser())
    this.app.use(session(sessionOptions))
    // TODO this.app.use(csurf)
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
  }
}
