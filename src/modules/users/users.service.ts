import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findDrivers() {
    return this.usersRepository.find({
      where: { role: UserRole.DRIVER },
      order: { fullName: 'ASC' },
    });
  }

  async findById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.fullName != null && dto.fullName.trim().length > 0) {
      user.fullName = dto.fullName.trim();
    }

    if (dto.phone != null && dto.phone.trim().length > 0) {
      user.phone = dto.phone.trim();
    }

    return this.usersRepository.save(user);
  }
}