import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findDrivers() {
    const drivers = await this.usersRepository.find({
      where: {
        role: UserRole.DRIVER,
        isActive: true,
      },
      order: {
        fullName: 'ASC',
      },
    });

    return drivers.map((driver) => ({
      id: driver.id,
      fullName: driver.fullName,
      phone: driver.phone,
      email: driver.email,
      isActive: driver.isActive,
    }));
  }
}