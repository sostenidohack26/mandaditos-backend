import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerAddress } from './entities/customer-address.entity';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CustomerAddressesService {
  constructor(
    @InjectRepository(CustomerAddress)
    private readonly addressesRepository: Repository<CustomerAddress>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(customerId: string, dto: CreateCustomerAddressDto) {
    const customer = await this.usersRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (dto.isPrimary) {
      await this.addressesRepository.update(
        { customer: { id: customerId } as any },
        { isPrimary: false },
      );
    }

    const address = this.addressesRepository.create({
      customer,
      alias: dto.alias,
      street: dto.street,
      number: dto.number,
      neighborhood: dto.neighborhood,
      references: dto.references ?? null,
      isPrimary: dto.isPrimary ?? false,
    });

    return this.addressesRepository.save(address);
  }

  async findByCustomer(customerId: string) {
    return this.addressesRepository.find({
      where: {
        customer: { id: customerId } as any,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}