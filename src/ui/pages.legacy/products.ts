import { mount } from '@corvux/core'
import type { CorvuxInstance, ReactiveState } from '@corvux/core'
import type { ProductService } from '@application/use-cases/ProductService'
import type { Product } from '@core/domain/entities/Product'
import { statusBadge, actionButtons } from '@ui/shared/badges'

function renderRows(products: Product[]): string {
  if (!products.length) {
    return `<tr><td colspan="5" class="px-4 py-10 text-center text-sm text-gray-500">No products yet.</td></tr>`
  }
  return products.map((p) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
      <td class="px-4 py-3 text-white">${p.name}</td>
      <td class="px-4 py-3 font-mono text-xs text-gray-300">${p.version}</td>
      <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${p.description}</td>
      <td class="px-4 py-3">${statusBadge(p.status)}</td>
      <td class="px-4 py-3">${actionButtons(p.id, p.status)}</td>
    </tr>
  `).join('')
}

type PageState = {
  rowsHtml: string
  countLabel: string
  formVisible: boolean
  formTitle: string
  submitLabel: string
  formError: boolean
  formErrorMsg: string
  editId: string
  [key: string]: unknown
}

export async function mountProductsPage(
  el: HTMLElement,
  service: ProductService,
): Promise<CorvuxInstance<ReactiveState>> {
  const products = await service.findAll()

  const app = mount({
    el,
    state: {
      rowsHtml: renderRows(products),
      countLabel: `${products.length} product${products.length !== 1 ? 's' : ''}`,
      formVisible: false,
      formTitle: 'New Product',
      submitLabel: 'Create',
      formError: false,
      formErrorMsg: '',
      editId: '',
    } satisfies PageState,
  })

  const state = app.state as PageState

  async function refresh() {
    const all = await service.findAll()
    state.rowsHtml = renderRows(all)
    state.countLabel = `${all.length} product${all.length !== 1 ? 's' : ''}`
  }

  function openCreate() {
    el.querySelector<HTMLInputElement>('#f-name')!.value = ''
    el.querySelector<HTMLInputElement>('#f-version')!.value = ''
    el.querySelector<HTMLInputElement>('#f-description')!.value = ''
    state.editId = ''
    state.formTitle = 'New Product'
    state.submitLabel = 'Create'
    state.formError = false
    state.formVisible = true
  }

  async function openEdit(id: string) {
    const product = await service.findById(id)
    if (!product) return
    el.querySelector<HTMLInputElement>('#f-name')!.value = product.name
    el.querySelector<HTMLInputElement>('#f-version')!.value = product.version
    el.querySelector<HTMLInputElement>('#f-description')!.value = product.description
    state.editId = id
    state.formTitle = 'Edit Product'
    state.submitLabel = 'Update'
    state.formError = false
    state.formVisible = true
  }

  el.querySelector('#btn-new-product')?.addEventListener('click', openCreate)

  el.querySelector('#btn-cancel')?.addEventListener('click', () => {
    state.formVisible = false
    state.editId = ''
  })

  el.querySelector('#btn-submit')?.addEventListener('click', async () => {
    const name = (el.querySelector<HTMLInputElement>('#f-name')?.value ?? '').trim()
    const version = (el.querySelector<HTMLInputElement>('#f-version')?.value ?? '').trim()
    const description = (el.querySelector<HTMLInputElement>('#f-description')?.value ?? '').trim()

    if (!name || !version) {
      state.formErrorMsg = 'Name and version are required.'
      state.formError = true
      return
    }

    if (state.editId) {
      await service.update(state.editId as string, { name, version, description })
    } else {
      await service.create({ name, version, description })
    }

    state.formVisible = false
    state.editId = ''
    state.formError = false
    await refresh()
  })

  app.watch('rowsHtml', () => bindActions())

  function bindActions() {
    el.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id!
        const action = btn.dataset.action!
        if (action === 'edit') { await openEdit(id); return }
        if (action === 'toggle') await service.toggleStatus(id)
        if (action === 'delete') await service.delete(id)
        await refresh()
      })
    })
  }

  bindActions()
  return app
}
