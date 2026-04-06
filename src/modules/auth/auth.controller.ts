import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleCustomerLoginDto } from './dto/google-customer-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google-customer-login')
  googleCustomerLogin(@Body() dto: GoogleCustomerLoginDto) {
    return this.authService.googleCustomerLogin(dto);
  }
}