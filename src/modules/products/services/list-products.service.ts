import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';

@Injectable()
export class ListProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  handle(query: ListProductsQueryDto) {
    return this.productsRepository.findManyPaginated({
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      search: query.search,
    });
  }
}
