import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { CreateProductService } from './services/create-product.service';
import { ListProductsService } from './services/list-products.service';
import { GetProductByIdService } from './services/get-product-by-id.service';
import { UpdateProductService } from './services/update-product.service';
import { DeleteProductService } from './services/delete-product.service';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('products')
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(
    private createProduct: CreateProductService,
    private listProducts: ListProductsService,
    private getProductById: GetProductByIdService,
    private updateProduct: UpdateProductService,
    private deleteProduct: DeleteProductService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Página (default: 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Itens por página (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'mouse',
    description: 'Filtro por descrição (contains, case-insensitive)',
  })
  @ApiOkResponse({
    description: 'Lista paginada de produtos',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              descricao: { type: 'string', example: 'Produto Exemplo' },
              valorVenda: { type: 'string', example: '199.90' },
              estoque: { type: 'number', example: 10 },
              images: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid' },
                    url: {
                      type: 'string',
                      example: '/uploads/images/img.jpg',
                    },
                    productId: { type: 'string', example: 'uuid' },
                  },
                },
              },
              createdAt: {
                type: 'string',
                example: '2026-02-05T20:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                example: '2026-02-05T20:00:00.000Z',
              },
            },
          },
        },
        page: { type: 'number', example: 1 },
        perPage: { type: 'number', example: 10 },
        hasNextPage: { type: 'boolean', example: true },
      },
    },
  })
  list(@Query() query: ListProductsQueryDto) {
    return this.listProducts.handle(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getProductById.handle(id);
  }

  // admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: {
          type: 'string',
          example: 'Produto Exemplo',
        },
        valorVenda: {
          type: 'number',
          example: 199.9,
        },
        estoque: {
          type: 'number',
          example: 10,
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['descricao', 'valorVenda', 'estoque'],
    },
  })
  create(@Body() dto: CreateProductDto, @UploadedFiles() files: unknown[]) {
    return this.createProduct.handle(dto, files);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @ApiParam({ name: 'id', type: String, example: 'uuid-do-produto' })
  @ApiBody({
    description: 'Campos para atualização (todos opcionais)',
    schema: {
      type: 'object',
      properties: {
        descricao: { type: 'string', example: 'Nova descrição' },
        valorVenda: { type: 'number', example: 249.9 },
        estoque: { type: 'number', example: 20 },
      },
    },
  })
  @ApiOkResponse({
    description: 'Produto atualizado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        descricao: { type: 'string', example: 'Nova descrição' },
        valorVenda: { type: 'string', example: '249.90' },
        estoque: { type: 'number', example: 20 },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              url: { type: 'string', example: '/uploads/images/img.jpg' },
              productId: { type: 'string', example: 'uuid' },
            },
          },
        },
        createdAt: { type: 'string', example: '2026-02-05T20:00:00.000Z' },
        updatedAt: { type: 'string', example: '2026-02-05T20:10:00.000Z' },
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProduct.handle(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteProduct.handle(id);
    return { message: 'Deleted' };
  }
}
