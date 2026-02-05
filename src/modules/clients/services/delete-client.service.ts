import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients.repository';

@Injectable()
export class DeleteClientService {
  constructor(private clientsRepository: ClientsRepository) {}

  async handle(id: string) {
    const clientExists = await this.clientsRepository.findById(id);

    if (!clientExists) {
      throw new NotFoundException('Client not found');
    }

    await this.clientsRepository.delete(id);
  }
}
