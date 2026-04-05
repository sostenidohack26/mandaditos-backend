import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { CustomerAddress } from '../customer-addresses/entities/customer-address.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(CustomerAddress)
    private readonly addressesRepository: Repository<CustomerAddress>,
  ) {}

  async create(dto: CreateOrderDto) {
    const customer = await this.usersRepository.findOne({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const address = await this.addressesRepository.findOne({
      where: { id: dto.addressId },
      relations: ['customer'],
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    const order = this.ordersRepository.create({
      customer,
      driver: null,
      address,
      title: dto.title ?? null,
      storeSuggestion: dto.storeSuggestion ?? null,
      generalNotes: dto.generalNotes ?? null,
      maxBudget: dto.maxBudget != null ? dto.maxBudget.toFixed(2) : null,
      substitutionsAllowed: dto.substitutionsAllowed,
      paymentMethod: dto.paymentMethod,
      status: OrderStatus.NEW,
      driverEarning: (45 + Math.floor(Math.random() * 35)).toFixed(2),
      deliveryNote: null,
      deliveryPhotoUrl: null,
      items: dto.items.map((item) =>
        this.orderItemsRepository.create({
          name: item.name,
          quantity: item.quantity,
          note: item.note ?? null,
        }),
      ),
    });

    return this.ordersRepository.save(order);
  }

  async findByCustomer(customerId: string) {
    return this.ordersRepository.find({
      where: {
        customer: { id: customerId } as any,
      },
      relations: ['address', 'driver', 'items'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAvailable() {
    return this.ordersRepository.find({
      where: {
        status: OrderStatus.NEW,
      },
      relations: ['address', 'customer', 'items'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findLive() {
    return this.ordersRepository.find({
      where: {
        status: In([
          OrderStatus.NEW,
          OrderStatus.ASSIGNED,
          OrderStatus.ON_WAY_TO_STORE,
          OrderStatus.SHOPPING,
          OrderStatus.PURCHASE_COMPLETED,
          OrderStatus.ON_WAY_TO_CUSTOMER,
        ]),
      },
      relations: ['address', 'customer', 'driver', 'items'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async assign(orderId: string, driverId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['driver'],
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const driver = await this.usersRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Repartidor no encontrado');
    }

    order.driver = driver;
    order.status = OrderStatus.ASSIGNED;

    return this.ordersRepository.save(order);
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['driver'],
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }

  async completeDelivery(
  orderId: string,
  deliveryNote?: string,
  deliveryPhotoUrl?: string,
 ) {
  const order = await this.ordersRepository.findOne({
    where: { id: orderId },
    relations: ['driver'],
  });

  if (!order) {
    throw new NotFoundException('Pedido no encontrado');
  }

  order.status = OrderStatus.DELIVERED;
  order.deliveryNote =
    deliveryNote != null && deliveryNote.trim().length > 0
        ? deliveryNote.trim()
        : null;
  order.deliveryPhotoUrl = deliveryPhotoUrl ?? null;

  return this.ordersRepository.save(order);
 }
}