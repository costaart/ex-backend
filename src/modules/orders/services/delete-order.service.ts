import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class DeleteOrderService {
  constructor(private ordersRepository: OrdersRepository) {}

  async handle(id: string) {
    await this.ordersRepository.delete(id);
  }
}
