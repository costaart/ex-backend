import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientsQueryDto } from './dto/list-clients-query.dto';

import { CreateClientService } from './services/create-client.service';
import { ListClientsService } from './services/list-clients.service';
import { GetClientByIdService } from './services/get-client-by-id.service';
import { UpdateClientService } from './services/update-client.service';
import { DeleteClientService } from './services/delete-client.service';

@ApiTags('clients')
@ApiBearerAuth()
@Controller({ path: 'clients', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(
    private createClient: CreateClientService,
    private listClients: ListClientsService,
    private getClientById: GetClientByIdService,
    private updateClient: UpdateClientService,
    private deleteClient: DeleteClientService,
  ) {}

  @Get()
  @Roles('ADMIN', 'USUARIO')
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
    example: 'acme',
    description: 'Busca por razão social, CNPJ ou email',
  })
  @ApiOkResponse({
    description: 'Lista paginada de clientes',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              razaoSocial: { type: 'string', example: 'ACME LTDA' },
              cnpj: { type: 'string', example: '12.345.678/0001-90' },
              email: { type: 'string', example: 'contato@acme.com' },
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
  list(@Query() query: ListClientsQueryDto) {
    return this.listClients.handle(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'USUARIO')
  @ApiParam({ name: 'id', type: String, example: 'uuid-do-cliente' })
  getById(@Param('id') id: string) {
    return this.getClientById.handle(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateClientDto) {
    return this.createClient.handle(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiParam({ name: 'id', type: String, example: 'uuid-do-cliente' })
  @ApiBody({
    description: 'Campos para atualização (todos opcionais)',
    schema: {
      type: 'object',
      properties: {
        razaoSocial: { type: 'string', example: 'ACME COMÉRCIO LTDA' },
        cnpj: { type: 'string', example: '12.345.678/0001-90' },
        email: { type: 'string', example: 'financeiro@acme.com' },
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.updateClient.handle(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiParam({ name: 'id', type: String, example: 'uuid-do-cliente' })
  async remove(@Param('id') id: string) {
    await this.deleteClient.handle(id);
    return { message: 'Deleted' };
  }
}
