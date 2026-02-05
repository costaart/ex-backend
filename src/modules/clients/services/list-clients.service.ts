import { Injectable } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients.repository';
import { ListClientsQueryDto } from '../dto/list-clients-query.dto';

@Injectable()
export class ListClientsService {
  constructor(private clientsRepository: ClientsRepository) {}

  handle(query: ListClientsQueryDto) {
    return this.clientsRepository.findManyPaginated({
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      search: query.search,
    });
  }
}
