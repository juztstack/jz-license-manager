import type { LicenseUseCases, CreateLicenseCommand } from '@core/ports/input/LicenseUseCases'
import type { LicenseRepository } from '@core/ports/output/LicenseRepository'
import { License } from '@core/domain/entities/License'
import { createLicenseId } from '@core/domain/value-objects/LicenseId'
import { createLicenseKey } from '@core/domain/value-objects/LicenseKey'
import type { LicenseId } from '@core/domain/value-objects/LicenseId'

export class LicenseService implements LicenseUseCases {
  private readonly repository: LicenseRepository

  constructor(repository: LicenseRepository) {
    this.repository = repository
  }

  async createLicense(command: CreateLicenseCommand): Promise<License> {
    const id = createLicenseId(crypto.randomUUID())
    const key = createLicenseKey(this.generateKey())

    const license = new License({
      id,
      key,
      productName: command.productName,
      assignedTo: command.assignedTo,
      status: 'active',
      expiresAt: command.expiresAt ?? null,
      createdAt: new Date(),
    })

    await this.repository.save(license)
    return license
  }

  async getLicense(id: LicenseId): Promise<License | null> {
    return this.repository.findById(id)
  }

  async listLicenses(): Promise<License[]> {
    return this.repository.findAll()
  }

  async revokeLicense(id: LicenseId): Promise<void> {
    const license = await this.repository.findById(id)
    if (!license) throw new Error(`License ${id} not found`)

    const revoked = new License({
      ...license.toPlainObject(),
      status: 'revoked',
    })

    await this.repository.save(revoked)
  }

  async updateLicense(id: LicenseId, updates: { productName?: string; assignedTo?: string; expiresAt?: Date | null }): Promise<void> {
    const license = await this.repository.findById(id)
    if (!license) throw new Error(`License ${id} not found`)
    await this.repository.save(new License({ ...license.toPlainObject(), ...updates }))
  }

  async deleteLicense(id: LicenseId): Promise<void> {
    await this.repository.delete(id)
  }

  private generateKey(): string {
    const segment = () =>
      Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, '0')
    return `${segment()}-${segment()}-${segment()}-${segment()}`
  }
}
