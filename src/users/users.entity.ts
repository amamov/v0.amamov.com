import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'USER',
  orderBy: {
    username: 'ASC',
  },
}) // USER : 테이블 명
export class UserEntity extends CommonEntity {
  @ApiProperty({ example: 'amamov@amamov.co' })
  @IsEmail()
  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string

  @ApiProperty({ example: 'amamov' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false, length: 200 })
  username: string

  @ApiProperty({ example: '1205' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false, select: false })
  password: string

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @IsNotEmpty()
  @Column({ type: 'boolean', default: false })
  isAdmin: boolean

  @ApiProperty({ example: 'users/me.png' })
  @IsString()
  @IsOptional()
  @Column({
    type: 'varchar',
    nullable: true,
    default:
      'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg',
  })
  thumbnailUrl?: string
}
