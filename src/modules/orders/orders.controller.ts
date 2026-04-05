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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CompleteDeliveryDto } from './dto/complete-delivery.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.userId !== dto.customerId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.create(dto);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string, @Req() req: any) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.userId !== customerId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.findByCustomer(customerId);
  }

  @Get('available')
  findAvailable(@Req() req: any) {
    if (
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.findAvailable();
  }

  @Get('live')
  findLive(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
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
      req.user.userId !== dto.driverId
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
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.ordersService.updateStatus(orderId, dto.status);
  }

  @Post(':orderId/complete-delivery')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/deliveries',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `delivery-${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  completeDelivery(
    @Param('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CompleteDeliveryDto,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.DRIVER &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('No autorizado');
    }

    const photoUrl = file ? `/uploads/deliveries/${file.filename}` : null;

    return this.ordersService.completeDelivery(
      orderId,
      dto.deliveryNote,
      photoUrl ?? undefined,
    );
  }
}