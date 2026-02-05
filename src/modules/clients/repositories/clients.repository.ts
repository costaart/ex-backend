import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type CreateClientData = {
  razaoSocial: string;
  cnpj: string;
  email: string;
};

type UpdateClientData = Partial<CreateClientData>;

@Injectable()
export class ClientsRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateClientData) {
    return this.prisma.client.create({ data });
  }

  async findManyPaginated(params: {
    page: number;
    perPage: number;
    search?: string;
  }) {
    const { page, perPage, search } = params;
    const skip = (page - 1) * perPage;

    const where: Prisma.ClientWhereInput = search
      ? {
          OR: [
            {
              razaoSocial: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            { cnpj: { contains: search } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const dataPlusOne = await this.prisma.client.findMany({
      skip,
      take: perPage + 1,
      where,
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = dataPlusOne.length > perPage;
    const data = hasNextPage ? dataPlusOne.slice(0, perPage) : dataPlusOne;

    return { data, page, perPage, hasNextPage };
  }

  findById(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateClientData) {
    return this.prisma.client.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }
}
