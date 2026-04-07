import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateMeDto } from './dto/update-me.dto';
import { AdminUpsertDriverDto } from './dto/admin-upsert-driver.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('drivers')
  findDrivers(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    return this.usersService.findDrivers();
  }

  @Post('drivers')
  createDriver(@Req() req: any, @Body() dto: AdminUpsertDriverDto) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    return this.usersService.createDriver(dto);
  }

  @Patch('drivers/:driverId')
  updateDriver(
    @Req() req: any,
    @Param('driverId') driverId: string,
    @Body() dto: AdminUpsertDriverDto,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    return this.usersService.updateDriver(driverId, dto);
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