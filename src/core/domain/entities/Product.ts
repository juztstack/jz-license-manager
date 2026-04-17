export type ProductStatus = 'active' | 'inactive'

export interface Product {
  id: string
  name: string
  version: string
  description: string
  status: ProductStatus
  createdAt: string
}
