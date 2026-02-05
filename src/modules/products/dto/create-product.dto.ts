import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  descricao!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  valorVenda!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  estoque!: number;
}
