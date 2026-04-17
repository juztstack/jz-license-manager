export type ClientStatus = 'active' | 'inactive'

export interface Client {
  id: string
  name: string
  contact: string
  company: string
  status: ClientStatus
  createdAt: string
}
