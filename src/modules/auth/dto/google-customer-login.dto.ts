import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleCustomerLoginDto {
  @IsString()
  @MaxLength(120)
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}