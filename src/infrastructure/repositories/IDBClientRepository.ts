import { IDBRepository } from '../db/idb'
import type { ClientRepository } from '@core/ports/output/ClientRepository'
import type { Client } from '@core/domain/entities/Client'

export class IDBClientRepository implements ClientRepository {
  private repo = new IDBRepository<Client>('clients')

  findAll(): Promise<Client[]> { return this.repo.findAll() }
  findById(id: string): Promise<Client | null> { return this.repo.findById(id) }
  save(client: Client): Promise<void> { return this.repo.save(client) }
  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
