import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;
}