import type { ClientRepository } from '@core/ports/output/ClientRepository'
import type { Client } from '@core/domain/entities/Client'

export interface CreateClientCommand {
  name: string
  contact: string
  company: string
}

export class ClientService {
  private repo: ClientRepository

  constructor(repo: ClientRepository) {
    this.repo = repo
  }

  findAll(): Promise<Client[]> { return this.repo.findAll() }
  findById(id: string): Promise<Client | null> { return this.repo.findById(id) }

  async create(cmd: CreateClientCommand): Promise<Client> {
    const client: Client = {
      id: crypto.randomUUID(),
      name: cmd.name,
      contact: cmd.contact,
      company: cmd.company,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    await this.repo.save(client)
    return client
  }

  async toggleStatus(id: string): Promise<void> {
    const client = await this.repo.findById(id)
    if (!client) throw new Error(`Client ${id} not found`)
    await this.repo.save({ ...client, status: client.status === 'active' ? 'inactive' : 'active' })
  }

  async update(id: string, cmd: Partial<CreateClientCommand>): Promise<void> {
    const client = await this.repo.findById(id)
    if (!client) throw new Error(`Client ${id} not found`)
    await this.repo.save({ ...client, ...cmd })
  }

  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
