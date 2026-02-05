import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type CreateProductData = {
  descricao: string;
  valorVenda: number;
  estoque: number;
};

type UpdateProductData = Partial<CreateProductData>;

type FindManyPaginatedParams = {
  page: number;
  perPage: number;
  search?: string;
};

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProductData) {
    return this.prisma.product.create({ data });
  }

  async findManyPaginated({ page, perPage, search }: FindManyPaginatedParams) {
    const skip = (page - 1) * perPage;

    const where: Prisma.ProductWhereInput = search
      ? {
          descricao: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const dataPlusOne = await this.prisma.product.findMany({
      skip,
      take: perPage + 1,
      where,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });

    const hasNextPage = dataPlusOne.length > perPage;
    const data = hasNextPage ? dataPlusOne.slice(0, perPage) : dataPlusOne;

    return { data, page, perPage, hasNextPage };
  }

  findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  update(id: string, data: UpdateProductData) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async createWithImages(
    data: { descricao: string; valorVenda: number; estoque: number },
    imageUrls: string[],
  ) {
    return this.prisma.product.create({
      data: {
        ...data,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });
  }
}
