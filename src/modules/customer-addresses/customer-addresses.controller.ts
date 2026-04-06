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
import { CustomerAddressesService } from './customer-addresses.service';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('customer-addresses')
@UseGuards(JwtAuthGuard)
export class CustomerAddressesController {
  constructor(
    private readonly customerAddressesService: CustomerAddressesService,
  ) {}

  @Get(':customerId')
findByCustomer(
  @Param('customerId') customerId: string,
  @Req() req: any,
 ) {
  console.log('ADDR req.user =>', req.user);
  console.log('ADDR customerId =>', customerId);

  if (
    req.user.role !== UserRole.ADMIN &&
    req.user.userId !== customerId
  ) {
    throw new ForbiddenException('No autorizado');
  }

  return this.customerAddressesService.findByCustomer(customerId);
 }

  @Get(':customerId')
  findByCustomer(
    @Param('customerId') customerId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.userId !== customerId
    ) {
      throw new ForbiddenException('No autorizado');
    }

    return this.customerAddressesService.findByCustomer(customerId);
  }
}