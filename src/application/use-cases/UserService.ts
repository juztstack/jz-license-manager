import type { UserRepository } from '@core/ports/output/UserRepository'
import type { User, UserRole } from '@core/domain/entities/User'

export interface CreateUserCommand {
  name: string
  email: string
  role: UserRole
}

export class UserService {
  private repo: UserRepository

  constructor(repo: UserRepository) {
    this.repo = repo
  }

  findAll(): Promise<User[]> { return this.repo.findAll() }
  findById(id: string): Promise<User | null> { return this.repo.findById(id) }

  async create(cmd: CreateUserCommand): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: cmd.name,
      email: cmd.email,
      role: cmd.role,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    await this.repo.save(user)
    return user
  }

  async toggleStatus(id: string): Promise<void> {
    const user = await this.repo.findById(id)
    if (!user) throw new Error(`User ${id} not found`)
    await this.repo.save({ ...user, status: user.status === 'active' ? 'inactive' : 'active' })
  }

  async update(id: string, cmd: Partial<CreateUserCommand>): Promise<void> {
    const user = await this.repo.findById(id)
    if (!user) throw new Error(`User ${id} not found`)
    await this.repo.save({ ...user, ...cmd })
  }

  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
