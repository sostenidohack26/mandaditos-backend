import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 120,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 25,
    unique: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'password_hash',
    type: 'text',
  })
  passwordHash: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}