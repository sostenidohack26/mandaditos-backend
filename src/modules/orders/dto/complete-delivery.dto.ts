import { IsOptional, IsString } from 'class-validator';

export class CompleteDeliveryDto {
  @IsOptional()
  @IsString()
  deliveryNote?: string;
}