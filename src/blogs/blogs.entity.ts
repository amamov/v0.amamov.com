import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import { Column, Entity } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity({
  name: 'BLOG',
})
export class BlogEntity extends CommonEntity {
  @IsEmail()
  @Column({ type: 'varchar', unique: true, nullable: false })
  title: string

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  thumbnail: string

  //TODO
}
