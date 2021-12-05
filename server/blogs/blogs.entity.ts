import { VisitorEntity } from '../visitors/visitors.entity'
import { IsBoolean, IsString } from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { UserEntity } from '../users/users.entity'
import { TagEntity } from '../tags/tags.entity'
import { BlogImageEntity } from './blog-images.entity'

@Entity({
  name: 'BLOG',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class BlogEntity extends CommonEntity {
  @IsString()
  @Column({ type: 'varchar', unique: true, nullable: true })
  title: string

  @IsString()
  @Column({ type: 'varchar', unique: true, nullable: true })
  slug: string

  @IsString()
  @Column({ type: 'varchar', nullable: true })
  thumbnail: string

  @IsString()
  @Column({ type: 'varchar', nullable: true })
  description: string

  @IsString()
  @Column({ type: 'text', nullable: true })
  contents: string

  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isPrivate: boolean

  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: true })
  isTemporary: boolean

  @ManyToOne(() => UserEntity, (author: UserEntity) => author.blogs, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    // foreignkey 정보들
    {
      name: 'author_id' /* db에 저장되는 필드 이름 */,
      referencedColumnName: 'id' /* USER의 id */,
    },
  ])
  author: UserEntity

  @OneToMany(
    () => BlogImageEntity,
    (blogImage: BlogImageEntity) => blogImage.blog,
    { cascade: true }, // 새 BLOG_IMAGE가 변화하고 BLOG가 저장되면 새 BLOG_IMAGE도 DB에 저장되어야 함
    // { cascade : ["insert", "update", "remove", "soft-remove", "recover"] }
  )
  images: BlogImageEntity[]

  @ManyToMany(() => TagEntity, (tag: TagEntity) => tag.blogs, {
    cascade: ['insert'], // 두개의 테이블 동시에 수정할때에는 cascade 옵션을 추가해주어야 한다.
  })
  @JoinTable({
    // table
    name: 'BLOG_TAG',
    joinColumn: {
      name: 'blog_id',

      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: TagEntity[]

  @OneToMany(() => VisitorEntity, (visitor: VisitorEntity) => visitor.blog, {
    cascade: true,
  })
  visitors: VisitorEntity[]
}
