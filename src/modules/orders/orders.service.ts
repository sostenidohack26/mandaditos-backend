import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async getLiveOrders() {
    return this.ordersRepository.find({
      where: {
        status: In([
          'new',
          'assigned',
          'on_way_to_store',
          'shopping',
          'purchase_completed',
          'on_way_to_customer',
        ]),
      },
      relations: {
        customer: true,
        driver: true,
        address: true,
        items: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getOrdersByCustomer(customerId: string) {
    return this.ordersRepository.find({
      where: {
        customer: { id: customerId } as any,
        status: Not('deleted' as any),
      },
      relations: {
        customer: true,
        driver: true,
        address: true,
        items: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}