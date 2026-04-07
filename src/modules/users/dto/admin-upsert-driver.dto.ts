import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class AdminUpsertDriverDto {
  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(4, 120)
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}