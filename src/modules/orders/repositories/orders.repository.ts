import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type FindManyPaginatedParams = {
  page: number;
  perPage: number;
  search?: string;
};

type OrderItemInput = {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
};

type CreateOrderParams = {
  clientId: string;
  userId: string;
  items: OrderItemInput[];
};

@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async findManyPaginated({ page, perPage, search }: FindManyPaginatedParams) {
    const skip = (page - 1) * perPage;

    const where: Prisma.OrderWhereInput = search
      ? {
          client: {
            OR: [
              {
                razaoSocial: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              { cnpj: { contains: search } },
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            ],
          },
        }
      : {};

    const dataPlusOne = await this.prisma.order.findMany({
      skip,
      take: perPage + 1,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: { id: true, razaoSocial: true, cnpj: true, email: true },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          select: { quantity: true, unitPrice: true },
        },
      },
    });

    const hasNextPage = dataPlusOne.length > perPage;
    const data = hasNextPage ? dataPlusOne.slice(0, perPage) : dataPlusOne;

    return { data, page, perPage, hasNextPage };
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                descricao: true,
                valorVenda: true,
                estoque: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }

  delete(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }

  findClientById(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, estoque: true, valorVenda: true },
    });
  }

  async createOrderWithItems(params: CreateOrderParams) {
    const { clientId, userId, items } = params;

    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.create({
        data: { clientId, userId },
      });

      await transaction.orderItem.createMany({
        data: items.map((i) => ({
          orderId: order.id,
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      for (const i of items) {
        await transaction.product.update({
          where: { id: i.productId },
          data: { estoque: { decrement: i.quantity } },
        });
      }

      return transaction.order.findUnique({
        where: { id: order.id },
        include: {
          client: true,
          user: { select: { id: true, name: true, email: true, role: true } },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  descricao: true,
                  valorVenda: true,
                  estoque: true,
                  images: true,
                },
              },
            },
          },
        },
      });
    });
  }
}
