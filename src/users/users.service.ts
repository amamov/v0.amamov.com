import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { Response } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { UserEntity } from './users.entity'
import * as bcrypt from 'bcrypt'
import { UserDto } from './dtos/user.dto'
import { UserLogInDto } from './dtos/user-login.dto'
import { UserRegisterDto } from './dtos/user-register.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(body: UserRegisterDto): Promise<UserDto> {
    const { email, password } = body
    this.logger.debug('hello')
    const user = await this.usersRepository.findOne({ email })
    if (user) {
      throw new UnauthorizedException('해당하는 이메일은 이미 존재합니다.')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    return await this.usersRepository.save({
      ...body,
      password: hashedPassword,
    })
  }

  async logIn(body: UserLogInDto, response: Response): Promise<UserDto> {
    const { email, password } = body
    const user = await this.usersRepository.findOne({ email })

    if (!user)
      throw new UnauthorizedException('해당하는 이메일은 존재하지 않습니다.')

    if (!(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('회원가입에 실패하였습니다.')
    try {
      const jwt = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: this.configService.get('SECRET_KEY') },
      )
      response.cookie('jwt', jwt, { httpOnly: true })

      return user
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async findUserById(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne(id)
    this.logger.log(user)
    return user
  }
}
