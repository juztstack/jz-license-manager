import type { BundleRepository } from '@core/ports/output/BundleRepository'
import type { Bundle } from '@core/domain/entities/Bundle'

export interface CreateBundleCommand {
  name: string
  description: string
  productIds: string[]
}

export class BundleService {
  private repo: BundleRepository

  constructor(repo: BundleRepository) {
    this.repo = repo
  }

  findAll(): Promise<Bundle[]> { return this.repo.findAll() }
  findById(id: string): Promise<Bundle | null> { return this.repo.findById(id) }

  async create(cmd: CreateBundleCommand): Promise<Bundle> {
    const bundle: Bundle = {
      id: crypto.randomUUID(),
      name: cmd.name,
      description: cmd.description,
      productIds: cmd.productIds,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    await this.repo.save(bundle)
    return bundle
  }

  async toggleStatus(id: string): Promise<void> {
    const bundle = await this.repo.findById(id)
    if (!bundle) throw new Error(`Bundle ${id} not found`)
    await this.repo.save({ ...bundle, status: bundle.status === 'active' ? 'inactive' : 'active' })
  }

  async update(id: string, cmd: Partial<Omit<CreateBundleCommand, 'productIds'>>): Promise<void> {
    const bundle = await this.repo.findById(id)
    if (!bundle) throw new Error(`Bundle ${id} not found`)
    await this.repo.save({ ...bundle, ...cmd })
  }

  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
