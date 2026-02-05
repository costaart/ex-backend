import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients.repository';

@Injectable()
export class GetClientByIdService {
  constructor(private clientsRepository: ClientsRepository) {}

  async handle(id: string) {
    const client = await this.clientsRepository.findById(id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return { client };
  }
}
