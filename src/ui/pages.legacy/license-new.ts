import { mount } from 'corvuxjs'
import type { CorvuxInstance, ReactiveState } from 'corvuxjs'
import type { LicenseService } from '@application/use-cases/LicenseService'
import type { RouterInstance } from '@corvux/router'

type PageState = {
  productName: string
  assignedTo: string
  expiresAt: string
  errorVisible: boolean
  errorMsg: string
  [key: string]: unknown
}

export async function mountLicenseNewPage(
  el: HTMLElement,
  service: LicenseService,
  router: RouterInstance,
): Promise<CorvuxInstance<ReactiveState>> {
  const app = mount({
    el,
    state: {
      productName: '',
      assignedTo: '',
      expiresAt: '',
      errorVisible: false,
      errorMsg: '',
    } satisfies PageState,
  })

  const state = app.state as PageState

  // Sync input → state (corvux data-bind sets input.value but needs event to sync back)
  const bindInput = (id: string, key: keyof PageState) => {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)
    if (!input) return
    input.addEventListener('input', () => {
      state[key] = input.value
    })
  }

  bindInput('input-product', 'productName')
  bindInput('input-assigned', 'assignedTo')
  bindInput('input-expires', 'expiresAt')

  el.querySelector('#btn-submit')?.addEventListener('click', async () => {
    const product = String(state.productName).trim()
    const assigned = String(state.assignedTo).trim()

    if (!product || !assigned) {
      state.errorMsg = 'Product name and assigned to are required.'
      state.errorVisible = true
      return
    }

    state.errorVisible = false

    const expiresRaw = String(state.expiresAt)
    const expiresAt = expiresRaw ? new Date(expiresRaw) : undefined

    await service.createLicense({ productName: product, assignedTo: assigned, expiresAt })
    router.navigate('/licenses')
  })

  return app
}
