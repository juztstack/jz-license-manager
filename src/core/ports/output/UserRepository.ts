import type { User } from '../../domain/entities/User'

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}
