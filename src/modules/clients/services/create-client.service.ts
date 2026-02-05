import { Injectable } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';
import { ClientsRepository } from '../repositories/clients.repository';

@Injectable()
export class CreateClientService {
  constructor(private clientsRepository: ClientsRepository) {}

  handle(dto: CreateClientDto) {
    return this.clientsRepository.create(dto);
  }
}
