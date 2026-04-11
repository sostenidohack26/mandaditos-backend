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
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    if (
      req.user.role !== UserRole.ADMIN &&
      !(
        req.user.role === UserRole.CUSTOMER &&
        req.user.userId === dto.customerId
      )
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.createOrder(dto);
  }

  @Get('live')
  getLiveOrders(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.getLiveOrders();
  }

  @Get('available')
  getAvailableOrders(@Req() req: any) {
    if (
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.getAvailableOrders();
  }

  @Get('driver/:driverId')
  async getOrdersByDriver(
    @Param('driverId') driverId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.userId !== driverId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    try {
      console.log('CONTROLLER driverId =', driverId);
      return await this.ordersService.getOrdersByDriver(driverId);
    } catch (error) {
      console.error(
        'CONTROLLER ERROR /orders/driver/:driverId =>',
        error,
      );
      throw error;
    }
  }

  @Patch(':orderId/assign')
  assignOrder(
    @Param('orderId') orderId: string,
    @Body() body: { driverId: string },
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('No autorizado');
    }

    const driverId =
      req.user.role === UserRole.DRIVER ? req.user.userId : body.driverId;

    return this.ordersService.assignOrder(orderId, driverId);
  }

  @Get('customer/:customerId')
  async getOrdersByCustomer(
    @Param('customerId') customerId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.userId !== customerId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    try {
      console.log('CONTROLLER customerId =', customerId);
      return await this.ordersService.getOrdersByCustomer(customerId);
    } catch (error) {
      console.error(
        'CONTROLLER ERROR /orders/customer/:customerId =>',
        error,
      );
      throw error;
    }
  }
}