import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class UpdateProductService {
  constructor(private productsRepository: ProductsRepository) {}

  async handle(id: string, dto: UpdateProductDto) {
    const productExists = await this.productsRepository.findById(id);

    if (!productExists) {
      throw new NotFoundException('Product not found');
    }

    return this.productsRepository.update(id, dto);
  }
}
