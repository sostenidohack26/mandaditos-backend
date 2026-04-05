import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { CustomerAddress } from '../../customer-addresses/entities/customer-address.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  customer: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  driver: User | null;

  @ManyToOne(() => CustomerAddress, { nullable: false, onDelete: 'RESTRICT' })
  address: CustomerAddress;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  title: string | null;

  @Column({
    name: 'store_suggestion',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  storeSuggestion: string | null;

  @Column({
    name: 'general_notes',
    type: 'text',
    nullable: true,
  })
  generalNotes: string | null;

  @Column({
    name: 'max_budget',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxBudget: string | null;

  @Column({
    name: 'substitutions_allowed',
    type: 'boolean',
    default: true,
  })
  substitutionsAllowed: boolean;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 40,
  })
  paymentMethod: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({
    name: 'driver_earning',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  driverEarning: string;

  @Column({
    name: 'delivery_note',
    type: 'text',
    nullable: true,
  })
  deliveryNote: string | null;

  @Column({
    name: 'delivery_photo_url',
    type: 'text',
    nullable: true,
  })
  deliveryPhotoUrl: string | null;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

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