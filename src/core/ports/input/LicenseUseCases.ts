import type { License } from '../../domain/entities/License'
import type { LicenseId } from '../../domain/value-objects/LicenseId'

export interface CreateLicenseCommand {
  productName: string
  assignedTo: string
  expiresAt?: Date
}

export interface LicenseUseCases {
  createLicense(command: CreateLicenseCommand): Promise<License>
  getLicense(id: LicenseId): Promise<License | null>
  listLicenses(): Promise<License[]>
  revokeLicense(id: LicenseId): Promise<void>
  deleteLicense(id: LicenseId): Promise<void>
}
