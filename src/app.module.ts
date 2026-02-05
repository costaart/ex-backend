import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, ClientsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
