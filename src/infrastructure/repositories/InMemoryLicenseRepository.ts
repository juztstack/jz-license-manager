import type { LicenseRepository } from '@core/ports/output/LicenseRepository'
import type { License } from '@core/domain/entities/License'
import type { LicenseId } from '@core/domain/value-objects/LicenseId'

export class InMemoryLicenseRepository implements LicenseRepository {
  private store = new Map<LicenseId, License>()

  async findById(id: LicenseId): Promise<License | null> {
    return this.store.get(id) ?? null
  }

  async findAll(): Promise<License[]> {
    return Array.from(this.store.values())
  }

  async save(license: License): Promise<void> {
    this.store.set(license.id, license)
  }

  async delete(id: LicenseId): Promise<void> {
    this.store.delete(id)
  }
}
