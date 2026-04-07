import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('live')
  getLiveOrders(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.getLiveOrders();
  }

  @Get('customer/:customerId')
  getOrdersByCustomer(
    @Param('customerId') customerId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.userId !== customerId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.getOrdersByCustomer(customerId);
  }
}