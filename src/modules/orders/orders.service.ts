import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { CustomerAddress } from '../customer-addresses/entities/customer-address.entity';
import { OrderStatus } from './enums/order-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

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

  async createOrder(dto: CreateOrderDto) {
    const customer = await this.usersRepository.findOne({
      where: {
        id: dto.customerId,
        role: UserRole.CUSTOMER,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const address = await this.addressesRepository.findOne({
      where: {
        id: dto.addressId,
        customer: { id: dto.customerId } as any,
      },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debes agregar al menos un artículo');
    }

    const order = this.ordersRepository.create({
      customer,
      driver: null,
      address,
      title: dto.title?.trim() || null,
      storeSuggestion: dto.storeSuggestion?.trim() || null,
      generalNotes: dto.generalNotes?.trim() || null,
      maxBudget: dto.maxBudget != null ? dto.maxBudget.toFixed(2) : null,
      substitutionsAllowed: dto.substitutionsAllowed,
      paymentMethod: dto.paymentMethod.trim(),
      status: OrderStatus.NEW,
      driverEarning: '0.00',
      deliveryNote: null,
      deliveryPhotoUrl: null,
      items: dto.items.map((item) =>
        this.orderItemsRepository.create({
          name: item.name.trim(),
          quantity: item.quantity,
          note: item.note?.trim() || null,
        }),
      ),
    });

    return this.ordersRepository.save(order);
  }

  async getLiveOrders() {
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

  async getAvailableOrders() {
    return this.ordersRepository.find({
      where: {
        status: OrderStatus.NEW,
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

  async getOrdersByDriver(driverId: string) {
    try {
      console.log('SERVICE driverId =', driverId);

      const result = await this.ordersRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.driver', 'driver')
        .leftJoinAndSelect('order.address', 'address')
        .leftJoinAndSelect('order.items', 'items')
        .where('driver.id = :driverId', { driverId })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      console.log('PEDIDOS DRIVER OK:', result.length);
      return result;
    } catch (error) {
      console.error('SERVICE ERROR getOrdersByDriver =>', error);
      throw error;
    }
  }

  async assignOrder(orderId: string, driverId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: {
        customer: true,
        driver: true,
        address: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const driver = await this.usersRepository.findOne({
      where: {
        id: driverId,
        role: UserRole.DRIVER,
      },
    });

    if (!driver) {
      throw new NotFoundException('Repartidor no encontrado');
    }

    if (order.status !== OrderStatus.NEW) {
      throw new BadRequestException('Este pedido ya no está disponible');
    }

    order.driver = driver;
    order.status = OrderStatus.ASSIGNED;

    return this.ordersRepository.save(order);
  }

  async getOrdersByCustomer(customerId: string) {
    try {
      console.log('SERVICE customerId =', customerId);

      const result = await this.ordersRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.driver', 'driver')
        .leftJoinAndSelect('order.address', 'address')
        .leftJoinAndSelect('order.items', 'items')
        .where('customer.id = :customerId', { customerId })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      console.log('PEDIDOS CLIENTE OK:', result.length);
      return result;
    } catch (error) {
      console.error('SERVICE ERROR getOrdersByCustomer =>', error);
      throw error;
    }
  }
}