import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  @Length(11, 18)
  cnpj?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
