import { IDBRepository } from '../db/idb'
import type { LicenseRepository } from '@core/ports/output/LicenseRepository'
import { License } from '@core/domain/entities/License'
import { createLicenseId } from '@core/domain/value-objects/LicenseId'
import { createLicenseKey } from '@core/domain/value-objects/LicenseKey'
import type { LicenseId } from '@core/domain/value-objects/LicenseId'
import type { LicenseStatus } from '@core/domain/value-objects/LicenseStatus'

interface LicenseRecord {
  id: string
  key: string
  productName: string
  assignedTo: string
  status: LicenseStatus
  expiresAt: string | null
  createdAt: string
}

function serialize(license: License): LicenseRecord {
  return {
    id: license.id,
    key: license.key,
    productName: license.productName,
    assignedTo: license.assignedTo,
    status: license.status,
    expiresAt: license.expiresAt?.toISOString() ?? null,
    createdAt: license.createdAt.toISOString(),
  }
}

function deserialize(r: LicenseRecord): License {
  return new License({
    id: createLicenseId(r.id),
    key: createLicenseKey(r.key),
    productName: r.productName,
    assignedTo: r.assignedTo,
    status: r.status,
    expiresAt: r.expiresAt ? new Date(r.expiresAt) : null,
    createdAt: new Date(r.createdAt),
  })
}

export class IDBLicenseRepository implements LicenseRepository {
  private repo = new IDBRepository<LicenseRecord>('licenses')

  async findAll(): Promise<License[]> {
    return (await this.repo.findAll()).map(deserialize)
  }

  async findById(id: LicenseId): Promise<License | null> {
    const r = await this.repo.findById(id)
    return r ? deserialize(r) : null
  }

  async save(license: License): Promise<void> {
    await this.repo.save(serialize(license))
  }

  async delete(id: LicenseId): Promise<void> {
    await this.repo.delete(id)
  }
}
