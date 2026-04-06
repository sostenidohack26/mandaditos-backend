import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleCustomerLoginDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}