import type { ProductRepository } from '@core/ports/output/ProductRepository'
import type { Product } from '@core/domain/entities/Product'

export interface CreateProductCommand {
  name: string
  version: string
  description: string
}

export class ProductService {
  private repo: ProductRepository

  constructor(repo: ProductRepository) {
    this.repo = repo
  }

  findAll(): Promise<Product[]> { return this.repo.findAll() }
  findById(id: string): Promise<Product | null> { return this.repo.findById(id) }

  async create(cmd: CreateProductCommand): Promise<Product> {
    const product: Product = {
      id: crypto.randomUUID(),
      name: cmd.name,
      version: cmd.version,
      description: cmd.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    await this.repo.save(product)
    return product
  }

  async toggleStatus(id: string): Promise<void> {
    const product = await this.repo.findById(id)
    if (!product) throw new Error(`Product ${id} not found`)
    await this.repo.save({ ...product, status: product.status === 'active' ? 'inactive' : 'active' })
  }

  async update(id: string, cmd: Partial<CreateProductCommand>): Promise<void> {
    const product = await this.repo.findById(id)
    if (!product) throw new Error(`Product ${id} not found`)
    await this.repo.save({ ...product, ...cmd })
  }

  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
