import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class DeleteProductService {
  constructor(private productsRepository: ProductsRepository) {}

  async handle(id: string) {
    const exists = await this.productsRepository.findById(id);

    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.delete(id);
  }
}
