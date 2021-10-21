import { IsIP, IsNotEmpty } from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BlogEntity } from '../blogs/blogs.entity'

@Entity({
  name: 'VISITOR',
})
export class VisitorEntity extends CommonEntity {
  @IsIP()
  @IsNotEmpty()
  @Column({ type: 'inet', nullable: false })
  ip: string

  @ManyToOne(() => BlogEntity, (blog: BlogEntity) => blog.visitors)
  @JoinColumn([{ name: 'blog_id', referencedColumnName: 'id' }])
  blog: BlogEntity
}
