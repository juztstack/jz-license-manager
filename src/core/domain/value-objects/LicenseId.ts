export type LicenseId = string & { readonly __brand: 'LicenseId' }

export function createLicenseId(value: string): LicenseId {
  if (!value.trim()) throw new Error('LicenseId cannot be empty')
  return value as LicenseId
}
