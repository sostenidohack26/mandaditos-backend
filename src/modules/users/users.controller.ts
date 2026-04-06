import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('test-me')
  testMe() {
    return { ok: true, route: 'users/test-me' };
  }

  @Get('drivers')
  findDrivers(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    return this.usersService.findDrivers();
  }

  @Get('me')
  findMe(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }
}