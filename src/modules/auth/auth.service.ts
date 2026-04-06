import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

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

  async login(dto: LoginDto) {
    const usernameOrPhone = dto.usernameOrPhone.trim();

    const user = await this.usersRepository.findOne({
      where: [
        { email: usernameOrPhone },
        { phone: usernameOrPhone },
      ],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido');
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return this.buildLoginResponse(user);
  }

  async googleCustomerLogin(dto: GoogleCustomerLoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone =
        dto.phone != null && dto.phone.trim().length > 0
            ? dto.phone.trim()
            : null;

    let user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user && normalizedPhone != null) {
      user = await this.usersRepository.findOne({
        where: { phone: normalizedPhone },
      });
    }

    if (!user) {
      user = this.usersRepository.create({
        role: UserRole.CUSTOMER,
        fullName: dto.fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash: '',
        isActive: true,
      });
    } else {
      user.fullName = dto.fullName.trim();
      user.email = normalizedEmail;
      user.phone = normalizedPhone;
      user.isActive = true;
    }

    const saved = await this.usersRepository.save(user);
    return this.buildLoginResponse(saved);
  }

  private buildLoginResponse(user: User) {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    });

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
}