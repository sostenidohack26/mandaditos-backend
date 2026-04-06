import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('order_tracking')
export class OrderTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  driver: User;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  latitude: string;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  longitude: string;

  @Column({
    name: 'heading',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  heading: string | null;

  @Column({
    name: 'speed',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  speed: string | null;

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