export type LicenseKey = string & { readonly __brand: 'LicenseKey' }

const KEY_REGEX = /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/

export function createLicenseKey(value: string): LicenseKey {
  if (!KEY_REGEX.test(value)) {
    throw new Error(`Invalid license key format. Expected XXXX-XXXX-XXXX-XXXX, got: ${value}`)
  }
  return value as LicenseKey
}
