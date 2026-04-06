import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CompleteDeliveryDto } from './dto/complete-delivery.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.CUSTOMER
    ) {
      throw new ForbiddenException('No autorizado');
    }

    if (
      req.user.role === UserRole.CUSTOMER &&
      req.user.userId !== dto.customerId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.create(dto);
  }

  @Get('customer/:customerId')
findByCustomer(
  @Param('customerId') customerId: string,
  @Req() req: any,
 ) {
  console.log('ORDERS req.user =>', req.user);
  console.log('ORDERS customerId =>', customerId);

  if (
    req.user.role !== UserRole.ADMIN &&
    req.user.userId !== customerId
  ) {
    throw new ForbiddenException('No autorizado');
  }

  return this.ordersService.findByCustomer(customerId);
 }

  @Get('live')
  findLive(@Req() req: any) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.DRIVER
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.findLive();
  }

  @Patch(':orderId/assign')
  assign(
    @Param('orderId') orderId: string,
    @Body() dto: AssignOrderDto,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.DRIVER
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.assign(orderId, dto.driverId);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.DRIVER
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.updateStatus(orderId, dto.status);
  }

  @Post(':orderId/complete-delivery')
  completeDelivery(
    @Param('orderId') orderId: string,
    @Body() dto: CompleteDeliveryDto,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.DRIVER
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.completeDelivery(
      orderId,
      dto.deliveryNote ?? '',
      '',
    );
  }
}