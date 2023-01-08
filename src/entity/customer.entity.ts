import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  cognito_id: string;

  @Column()
  name: string;

  @Index()
  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @CreateDateColumn({ select: false })
  created_at: string;

  @UpdateDateColumn({ select: false })
  updated_at: string;

  @DeleteDateColumn({ select: false })
  deleted_at: string;
}
