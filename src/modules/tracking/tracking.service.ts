import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderTracking } from './entities/order-tracking.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(OrderTracking)
    private readonly trackingRepository: Repository<OrderTracking>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async updateOrderLocation(
    orderId: string,
    driverId: string,
    latitude: number,
    longitude: number,
    heading?: number,
    speed?: number,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['driver', 'customer', 'address'],
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

    let tracking = await this.trackingRepository.findOne({
      where: {
        order: { id: orderId } as any,
      },
      relations: ['order', 'driver'],
    });

    if (!tracking) {
      tracking = this.trackingRepository.create({
        order,
        driver,
        latitude: latitude.toFixed(7),
        longitude: longitude.toFixed(7),
        heading:
            heading != null ? heading.toFixed(2) : null,
        speed:
            speed != null ? speed.toFixed(2) : null,
      });
    } else {
      tracking.latitude = latitude.toFixed(7);
      tracking.longitude = longitude.toFixed(7);
      tracking.heading =
          heading != null ? heading.toFixed(2) : null;
      tracking.speed =
          speed != null ? speed.toFixed(2) : null;
      tracking.driver = driver;
      tracking.order = order;
    }

    const saved = await this.trackingRepository.save(tracking);

    return {
      ok: true,
      tracking: saved,
    };
  }

  async getOrderLocation(orderId: string) {
    const tracking = await this.trackingRepository.findOne({
      where: {
        order: { id: orderId } as any,
      },
      relations: ['order', 'driver'],
    });

    if (!tracking) {
      return {
        ok: false,
        message: 'Sin ubicación disponible',
      };
    }

    return {
      ok: true,
      orderId,
      driver: {
        id: tracking.driver.id,
        fullName: tracking.driver.fullName,
        phone: tracking.driver.phone,
      },
      latitude: Number(tracking.latitude),
      longitude: Number(tracking.longitude),
      heading: tracking.heading != null ? Number(tracking.heading) : null,
      speed: tracking.speed != null ? Number(tracking.speed) : null,
      updatedAt: tracking.updatedAt,
    };
  }
}