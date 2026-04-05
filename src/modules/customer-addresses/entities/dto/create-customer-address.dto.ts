import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsString()
  @MaxLength(80)
  alias: string;

  @IsString()
  @MaxLength(120)
  street: string;

  @IsString()
  @MaxLength(30)
  number: string;

  @IsString()
  @MaxLength(120)
  neighborhood: string;

  @IsOptional()
  @IsString()
  references?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}