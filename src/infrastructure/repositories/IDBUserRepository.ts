import { IDBRepository } from '../db/idb'
import type { UserRepository } from '@core/ports/output/UserRepository'
import type { User } from '@core/domain/entities/User'

export class IDBUserRepository implements UserRepository {
  private repo = new IDBRepository<User>('users')

  findAll(): Promise<User[]> { return this.repo.findAll() }
  findById(id: string): Promise<User | null> { return this.repo.findById(id) }
  save(user: User): Promise<void> { return this.repo.save(user) }
  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
