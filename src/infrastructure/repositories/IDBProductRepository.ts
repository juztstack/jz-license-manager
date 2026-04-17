import { IDBRepository } from '../db/idb'
import type { ProductRepository } from '@core/ports/output/ProductRepository'
import type { Product } from '@core/domain/entities/Product'

export class IDBProductRepository implements ProductRepository {
  private repo = new IDBRepository<Product>('products')

  findAll(): Promise<Product[]> { return this.repo.findAll() }
  findById(id: string): Promise<Product | null> { return this.repo.findById(id) }
  save(product: Product): Promise<void> { return this.repo.save(product) }
  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
