import { IDBRepository } from '../db/idb'
import type { BundleRepository } from '@core/ports/output/BundleRepository'
import type { Bundle } from '@core/domain/entities/Bundle'

export class IDBBundleRepository implements BundleRepository {
  private repo = new IDBRepository<Bundle>('bundles')

  findAll(): Promise<Bundle[]> { return this.repo.findAll() }
  findById(id: string): Promise<Bundle | null> { return this.repo.findById(id) }
  save(bundle: Bundle): Promise<void> { return this.repo.save(bundle) }
  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
