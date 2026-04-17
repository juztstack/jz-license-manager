import type { License } from '../../domain/entities/License'
import type { LicenseId } from '../../domain/value-objects/LicenseId'

export interface LicenseRepository {
  findById(id: LicenseId): Promise<License | null>
  findAll(): Promise<License[]>
  save(license: License): Promise<void>
  delete(id: LicenseId): Promise<void>
}
