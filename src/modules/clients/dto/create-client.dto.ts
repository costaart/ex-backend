import { IsEmail, IsString, Length } from 'class-validator';

export class CreateClientDto {
  @IsString()
  razaoSocial!: string;

  @IsString()
  @Length(11, 18)
  cnpj!: string;

  @IsEmail()
  email!: string;
}
