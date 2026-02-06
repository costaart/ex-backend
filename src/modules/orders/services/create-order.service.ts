import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrdersRepository } from '../repositories/orders.repository';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class CreateOrderService {
  constructor(private ordersRepository: OrdersRepository) {}

  async handle(dto: CreateOrderDto, userId: string) {
    const client = await this.ordersRepository.findClientById(dto.clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const user = await this.ordersRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ids = dto.items.map((i) => i.productId);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new BadRequestException(
        'Não envie o mesmo produto duas vezes no pedido.',
      );
    }

    const products = await this.ordersRepository.findProductsByIds(ids);

    if (products.length !== ids.length) {
      throw new BadRequestException(
        'Um ou mais produtos informados não existem.',
      );
    }

    const itemsWithPrice = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;

      if (item.quantity > product.estoque) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${item.productId}. Disponível: ${product.estoque}`,
        );
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(product.valorVenda),
      };
    });

    const created = await this.ordersRepository.createOrderWithItems({
      clientId: dto.clientId,
      userId,
      items: itemsWithPrice,
    });

    if (!created) {
      throw new Error('Failed to create order');
    }

    return created;
  }
}
