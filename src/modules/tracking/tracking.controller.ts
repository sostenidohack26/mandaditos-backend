import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('order/:orderId')
  updateOrderLocation(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateLocationDto,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.trackingService.updateOrderLocation(
      orderId,
      req.user.userId,
      dto.latitude,
      dto.longitude,
      dto.heading,
      dto.speed,
    );
  }

  @Get('order/:orderId')
  getOrderLocation(@Param('orderId') orderId: string, @Req() req: any) {
    if (
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.CUSTOMER
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.trackingService.getOrderLocation(orderId);
  }
}