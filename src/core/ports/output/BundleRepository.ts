import type { Bundle } from '../../domain/entities/Bundle'

export interface BundleRepository {
  findAll(): Promise<Bundle[]>
  findById(id: string): Promise<Bundle | null>
  save(bundle: Bundle): Promise<void>
  delete(id: string): Promise<void>
}
