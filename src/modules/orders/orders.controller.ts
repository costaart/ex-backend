import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';

import { CreateOrderService } from './services/create-order.service';
import { ListOrdersService } from './services/list-orders.service';
import { GetOrderByIdService } from './services/get-order-by-id.service';
import { DeleteOrderService } from './services/delete-order.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
    role: 'ADMIN' | 'USUARIO';
  };
};

@ApiTags('orders')
@ApiBearerAuth()
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private createOrder: CreateOrderService,
    private listOrders: ListOrdersService,
    private getOrderById: GetOrderByIdService,
    private deleteOrder: DeleteOrderService,
  ) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'acme' })
  @ApiOkResponse({
    description: 'Lista paginada (resumo) de pedidos',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              createdAt: {
                type: 'string',
                example: '2026-02-05T20:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                example: '2026-02-05T20:00:00.000Z',
              },
              client: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  razaoSocial: { type: 'string', example: 'ACME LTDA' },
                  cnpj: { type: 'string', example: '12.345.678/0001-90' },
                  email: { type: 'string', example: 'contato@acme.com' },
                },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  name: { type: 'string', example: 'Arthur' },
                  email: { type: 'string', example: 'arthur@acme.com' },
                  role: { type: 'string', example: 'USUARIO' },
                },
              },
              itemsCount: { type: 'number', example: 3 },
            },
          },
        },
        page: { type: 'number', example: 1 },
        perPage: { type: 'number', example: 10 },
        hasNextPage: { type: 'boolean', example: true },
      },
    },
  })
  list(@Query() query: ListOrdersQueryDto) {
    return this.listOrders.handle(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, example: 'uuid-do-pedido' })
  getById(@Param('id') id: string) {
    return this.getOrderById.handle(id);
  }

  @Post()
  @ApiBody({
    description:
      'Cria um pedido para um cliente com itens (productId + quantity)',
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', example: 'uuid-do-cliente' },
        items: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: 'uuid-do-produto' },
              quantity: { type: 'number', example: 2 },
            },
            required: ['productId', 'quantity'],
          },
        },
      },
      required: ['clientId', 'items'],
    },
  })
  create(@Body() dto: CreateOrderDto, @Request() req: AuthenticatedRequest) {
    return this.createOrder.handle(dto, req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiParam({ name: 'id', type: String, example: 'uuid-do-pedido' })
  async remove(@Param('id') id: string) {
    await this.deleteOrder.handle(id);
    return { message: 'Deleted' };
  }
}
