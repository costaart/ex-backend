import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { ProductsController } from './products.controller';
import { ProductsRepository } from './repositories/products.repository';

import { CreateProductService } from './services/create-product.service';
import { ListProductsService } from './services/list-products.service';
import { GetProductByIdService } from './services/get-product-by-id.service';
import { UpdateProductService } from './services/update-product.service';
import { DeleteProductService } from './services/delete-product.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/images',
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsRepository,
    CreateProductService,
    ListProductsService,
    GetProductByIdService,
    UpdateProductService,
    DeleteProductService,
  ],
})
export class ProductsModule {}
