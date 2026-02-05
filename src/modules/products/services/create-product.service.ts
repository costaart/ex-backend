import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { CreateProductDto } from '../dto/create-product.dto';

type UploadedFile = { filename: string };

function isUploadedFile(value: unknown): value is UploadedFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'filename' in value &&
    typeof (value as { filename: unknown }).filename === 'string'
  );
}

@Injectable()
export class CreateProductService {
  constructor(private productsRepository: ProductsRepository) {}

  async handle(dto: CreateProductDto, files?: unknown) {
    if (!Array.isArray(files) || files.length === 0) {
      return this.productsRepository.create(dto);
    }

    const validFiles = files.filter(isUploadedFile);
    if (validFiles.length === 0) {
      return this.productsRepository.create(dto);
    }

    const imageUrls = validFiles.map(
      (file) => `/uploads/images/${file.filename}`,
    );

    return this.productsRepository.createWithImages(dto, imageUrls);
  }
}
