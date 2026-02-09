import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { Server } from 'http';
import {
  LoginResponse,
  ProductResponse,
  ClientResponse,
} from './utils/interfaces';

const prisma = new PrismaClient();

describe('Test E2E - Teste Técnico Excellent Sistemas', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@teste.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    await prisma.user.create({
      data: {
        name: 'User',
        email: 'user@teste.com',
        password: hashedPassword,
        role: 'USUARIO',
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('Auth', () => {
    it('should log as role admin', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: 'admin@teste.com', password: '123456' })
        .expect(201);

      const body = response.body as LoginResponse;

      expect(body.accessToken).toBeDefined();
      adminToken = body.accessToken;
    });

    it('should log as role user', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: 'user@teste.com', password: '123456' })
        .expect(201);

      const body = response.body as LoginResponse;
      userToken = body.accessToken;
    });
  });

  describe('Products', () => {
    const produtoDto: CreateProductDto = {
      descricao: 'Produto Teste',
      valorVenda: 150.0,
      estoque: 10,
    };

    it('should not be able to create a product (user)', async () => {
      await request(app.getHttpServer() as Server)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(produtoDto)
        .expect(403);
    });

    it('should be able to create a product (admin)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(produtoDto)
        .expect(201);

      const body = response.body as ProductResponse;

      expect(body.id).toBeDefined();
      expect(body.descricao).toBe(produtoDto.descricao);
      expect(Number(body.valorVenda)).toBe(produtoDto.valorVenda);
    });
  });

  describe('Clients', () => {
    const generateClient = () => {
      const uniqueId = Date.now().toString();
      return {
        razaoSocial: `Empresa Teste ${uniqueId}`,
        cnpj: uniqueId,
        email: `cliente${uniqueId}@teste.com`,
      };
    };

    it('should not be able to create a client (user)', async () => {
      const dto = generateClient();
      const teste = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto)
        .expect(403);

      console.log(teste);
    });

    it('should be able to create a client (admin)', async () => {
      const dto = generateClient();

      const response = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      const body = response.body as ClientResponse;

      expect(body.id).toBeDefined();
      expect(body.razaoSocial).toBe(dto.razaoSocial);
      expect(body.cnpj).toBe(dto.cnpj);
    });
  });

  describe('Orders', () => {
    let clientId: string;
    let productId: string;

    beforeAll(async () => {
      const clientDto = {
        razaoSocial: 'Cliente Pedido',
        cnpj: Date.now().toString(),
        email: `cliente${Date.now()}@teste.com`,
      };

      const clientRes = await request(app.getHttpServer() as Server)
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(clientDto)
        .expect(201);

      clientId = (clientRes.body as ClientResponse).id;

      const productDto: CreateProductDto = {
        descricao: 'Produto Pedido',
        valorVenda: 50.0,
        estoque: 100,
      };

      const productRes = await request(app.getHttpServer() as Server)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productDto)
        .expect(201);

      productId = (productRes.body as ProductResponse).id;
    });

    it('should be able to create an order (user)', async () => {
      const orderDto = {
        clientId: clientId,
        items: [
          {
            productId: productId,
            quantity: 2,
          },
        ],
      };

      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderDto)
        .expect(201);
    });
  });
});
