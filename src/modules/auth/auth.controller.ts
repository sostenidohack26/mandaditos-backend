import { Body, Controller, OnModuleInit, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleCustomerLoginDto } from './dto/google-customer-login.dto';

@Controller('auth')
export class AuthController implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    await this.authService.seedAdminAndDriverIfNeeded();
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google-customer')
  googleCustomer(@Body() dto: GoogleCustomerLoginDto) {
    return this.authService.loginGoogleCustomer(dto);
  }
}