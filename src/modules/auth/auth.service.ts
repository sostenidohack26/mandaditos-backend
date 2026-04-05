import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { GoogleCustomerLoginDto } from './dto/google-customer-login.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async seedAdminAndDriverIfNeeded() {
    const adminExists = await this.usersRepository.findOne({
      where: { email: 'admin@mandaditos.local' },
    });

    if (!adminExists) {
      const adminPassword = await bcrypt.hash('123456', 10);

      await this.usersRepository.save(
        this.usersRepository.create({
          role: UserRole.ADMIN,
          fullName: 'Super Admin',
          phone: '0000000001',
          email: 'admin@mandaditos.local',
          passwordHash: adminPassword,
          isActive: true,
        }),
      );
    }

    const driverExists = await this.usersRepository.findOne({
      where: { email: 'pedro@mandaditos.local' },
    });

    if (!driverExists) {
      const driverPassword = await bcrypt.hash('123456', 10);

      await this.usersRepository.save(
        this.usersRepository.create({
          role: UserRole.DRIVER,
          fullName: 'Pedro Repartidor',
          phone: '0000000002',
          email: 'pedro@mandaditos.local',
          passwordHash: driverPassword,
          isActive: true,
        }),
      );
    }
  }

  async login(dto: LoginDto) {
    const value = dto.usernameOrPhone.trim().toLowerCase();

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :value', { value })
      .orWhere('user.phone = :phone', { phone: dto.usernameOrPhone.trim() })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.DRIVER) {
      throw new UnauthorizedException('Acceso no permitido');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  async loginGoogleCustomer(dto: GoogleCustomerLoginDto) {
    const normalizedEmail = dto.email?.trim().toLowerCase();

    let user: User | null = null;

    if (normalizedEmail != null && normalizedEmail.length > 0) {
      user = await this.usersRepository.findOne({
        where: { email: normalizedEmail },
      });
    }

    if (!user && dto.phone != null && dto.phone.trim().length > 0) {
      user = await this.usersRepository.findOne({
        where: { phone: dto.phone.trim() },
      });
    }

    if (!user) {
      user = this.usersRepository.create({
        role: UserRole.CUSTOMER,
        fullName: dto.fullName.trim(),
        phone: dto.phone != null && dto.phone.trim().length > 0
            ? dto.phone.trim()
            : `cust_${Date.now()}`,
        email: normalizedEmail ?? null,
        passwordHash: 'google_auth',
        isActive: true,
      });
    } else {
      user.fullName = dto.fullName.trim();
      user.email = normalizedEmail ?? user.email;
      user.isActive = true;
    }

    const savedUser = await this.usersRepository.save(user);

    const payload = {
      sub: savedUser.id,
      role: savedUser.role,
      phone: savedUser.phone,
      email: savedUser.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: savedUser.id,
        fullName: savedUser.fullName,
        phone: savedUser.phone,
        email: savedUser.email,
        role: savedUser.role,
      },
      accessToken,
    };
  }
}