import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients.repository';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class UpdateClientService {
  constructor(private clientsRepository: ClientsRepository) {}

  async handle(id: string, dto: UpdateClientDto) {
    const clientExists = await this.clientsRepository.findById(id);

    if (!clientExists) {
      throw new NotFoundException('Client not found');
    }

    return this.clientsRepository.update(id, dto);
  }
}
