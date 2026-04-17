export type BundleStatus = 'active' | 'inactive'

export interface Bundle {
  id: string
  name: string
  description: string
  productIds: string[]
  status: BundleStatus
  createdAt: string
}
