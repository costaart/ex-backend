import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './repositories/clients.repository';
import { CreateClientService } from './services/create-client.service';
import { DeleteClientService } from './services/delete-client.service';
import { GetClientByIdService } from './services/get-client-by-id.service';
import { ListClientsService } from './services/list-clients.service';
import { UpdateClientService } from './services/update-client.service';

@Module({
  controllers: [ClientsController],
  providers: [
    ClientsRepository,
    CreateClientService,
    ListClientsService,
    GetClientByIdService,
    UpdateClientService,
    DeleteClientService,
  ],
})
export class ClientsModule {}
