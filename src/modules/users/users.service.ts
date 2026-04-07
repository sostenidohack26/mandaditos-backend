import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateMeDto } from './dto/update-me.dto';
import { AdminUpsertDriverDto } from './dto/admin-upsert-driver.dto';

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

  async createDriver(dto: AdminUpsertDriverDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.usersRepository.findOne({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un usuario con ese correo');
    }

    if (!dto.password || dto.password.trim().length < 4) {
      throw new BadRequestException(
        'La contraseña es obligatoria para crear repartidor',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password.trim(), 10);

    const driver = this.usersRepository.create({
      fullName: dto.fullName.trim(),
      phone: dto.phone?.trim() ?? null,
      email,
      passwordHash,
      isActive: dto.isActive ?? true,
      role: UserRole.DRIVER,
    });

    return this.usersRepository.save(driver);
  }

  async updateDriver(driverId: string, dto: AdminUpsertDriverDto) {
    const driver = await this.usersRepository.findOne({
      where: {
        id: driverId,
        role: UserRole.DRIVER,
      },
    });

    if (!driver) {
      throw new NotFoundException('Repartidor no encontrado');
    }

    const email = dto.email.trim().toLowerCase();

    if (email !== driver.email) {
      const existing = await this.usersRepository.findOne({
        where: { email },
      });

      if (existing && existing.id !== driver.id) {
        throw new BadRequestException('Ya existe un usuario con ese correo');
      }
    }

    driver.fullName = dto.fullName.trim();
    driver.phone = dto.phone?.trim() ?? null;
    driver.email = email;
    driver.isActive = dto.isActive ?? driver.isActive;

    if (dto.password != null && dto.password.trim().length > 0) {
      driver.passwordHash = await bcrypt.hash(dto.password.trim(), 10);
    }

    return this.usersRepository.save(driver);
  }
}