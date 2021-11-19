import {
  CacheInterceptor,
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import * as Joi from 'joi'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { AppController } from './app.controller'
import { UserEntity } from './users/users.entity'
import { UsersModule } from './users/users.module'
import { TagsModule } from './tags/tags.module'
import { BlogsModule } from './blogs/blogs.module'
import { VisitorsModule } from './visitors/visitors.module'
import { BlogEntity } from './blogs/blogs.entity'
import { BlogImageEntity } from './blogs/blog-images.entity'
import { TagEntity } from './tags/tags.entity'
import { VisitorEntity } from './visitors/visitors.entity'
import { APP_INTERCEPTOR } from '@nestjs/core'

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [
      UserEntity,
      BlogEntity,
      BlogImageEntity,
      TagEntity,
      VisitorEntity,
    ],
    synchronize: false, //! warning
    autoLoadEntities: true,
    logging: configService.get('NODE_ENV') === 'production' ? false : true,
    keepConnectionAlive: true,
  }),
  inject: [ConfigService],
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(5500),
        SECRET_KEY: Joi.string().required(),
        ADMIN_USER: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    CacheModule.register({
      ttl: 20, // seconds
      max: 20, // maximum number of items in cache
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
    TagsModule,
    BlogsModule,
    VisitorsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // const DEBUG = process.env.NODE_ENV === 'development' ? true : false
  }
}
