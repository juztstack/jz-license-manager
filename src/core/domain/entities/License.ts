import type { LicenseId } from '../value-objects/LicenseId'
import type { LicenseKey } from '../value-objects/LicenseKey'
import type { LicenseStatus } from '../value-objects/LicenseStatus'

export interface LicenseProps {
  id: LicenseId
  key: LicenseKey
  productName: string
  assignedTo: string
  status: LicenseStatus
  expiresAt: Date | null
  createdAt: Date
}

export class License {
  private readonly props: LicenseProps

  constructor(props: LicenseProps) {
    this.props = props
  }

  get id(): LicenseId { return this.props.id }
  get key(): LicenseKey { return this.props.key }
  get productName(): string { return this.props.productName }
  get assignedTo(): string { return this.props.assignedTo }
  get status(): LicenseStatus { return this.props.status }
  get expiresAt(): Date | null { return this.props.expiresAt }
  get createdAt(): Date { return this.props.createdAt }

  isExpired(): boolean {
    if (!this.props.expiresAt) return false
    return this.props.expiresAt < new Date()
  }

  toPlainObject(): LicenseProps {
    return { ...this.props }
  }
}
