import { IsNotEmpty, IsString } from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity'
import { Column, Entity, ManyToMany } from 'typeorm'
import { BlogEntity } from '../blogs/blogs.entity'

@Entity({
  name: 'TAG',
})
export class TagEntity extends CommonEntity {
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  name: string

  @ManyToMany(() => BlogEntity, (blog: BlogEntity) => blog.tags)
  blogs: BlogEntity[]
}
