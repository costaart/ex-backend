import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { ListOrdersQueryDto } from '../dto/list-orders-query.dto';

@Injectable()
export class ListOrdersService {
  constructor(private ordersRepository: OrdersRepository) {}

  async handle(query: ListOrdersQueryDto) {
    const result = await this.ordersRepository.findManyPaginated({
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      search: query.search,
    });

    const data = result.data.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      client: order.client,
      user: order.user,
      itemsCount: order.items.reduce((acc, i) => acc + i.quantity, 0),
    }));

    return {
      data,
      page: result.page,
      perPage: result.perPage,
      hasNextPage: result.hasNextPage,
    };
  }
}
