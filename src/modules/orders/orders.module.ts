import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './repositories/orders.repository';
import { CreateOrderService } from './services/create-order.service';
import { DeleteOrderService } from './services/delete-order.service';
import { GetOrderByIdService } from './services/get-order-by-id.service';
import { ListOrdersService } from './services/list-orders.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersRepository,
    CreateOrderService,
    DeleteOrderService,
    GetOrderByIdService,
    ListOrdersService,
  ],
})
export class OrdersModule {}
