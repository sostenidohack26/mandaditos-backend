import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('customer_addresses')
export class CustomerAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  customer: User;

  @Column({
    name: 'alias',
    type: 'varchar',
    length: 80,
  })
  alias: string;

  @Column({
    name: 'street',
    type: 'varchar',
    length: 120,
  })
  street: string;

  @Column({
    name: 'number',
    type: 'varchar',
    length: 30,
  })
  number: string;

  @Column({
    name: 'neighborhood',
    type: 'varchar',
    length: 120,
  })
  neighborhood: string;

  @Column({
    name: 'references',
    type: 'text',
    nullable: true,
  })
  references: string | null;

  @Column({
    name: 'is_primary',
    type: 'boolean',
    default: false,
  })
  isPrimary: boolean;

  @Column({
    name: 'latitude',
    type: 'double precision',
    nullable: true,
  })
  latitude: number | null;

  @Column({
    name: 'longitude',
    type: 'double precision',
    nullable: true,
  })
  longitude: number | null;

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