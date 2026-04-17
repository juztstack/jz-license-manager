import { mount } from 'corvuxjs'
import type { CorvuxInstance, ReactiveState } from 'corvuxjs'
import type { BundleService } from '@application/use-cases/BundleService'
import type { Bundle } from '@core/domain/entities/Bundle'
import { statusBadge, actionButtons } from '@ui/shared/badges'

function renderRows(bundles: Bundle[]): string {
  if (!bundles.length) {
    return `<tr><td colspan="5" class="px-4 py-10 text-center text-sm text-gray-500">No bundles yet.</td></tr>`
  }
  return bundles.map((b) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
      <td class="px-4 py-3 text-white">${b.name}</td>
      <td class="px-4 py-3 text-gray-400 text-xs">${b.productIds.length} product${b.productIds.length !== 1 ? 's' : ''}</td>
      <td class="px-4 py-3 text-gray-400 max-w-xs truncate">${b.description}</td>
      <td class="px-4 py-3">${statusBadge(b.status)}</td>
      <td class="px-4 py-3">${actionButtons(b.id, b.status)}</td>
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

export async function mountBundlesPage(
  el: HTMLElement,
  service: BundleService,
): Promise<CorvuxInstance<ReactiveState>> {
  const bundles = await service.findAll()

  const app = mount({
    el,
    state: {
      rowsHtml: renderRows(bundles),
      countLabel: `${bundles.length} bundle${bundles.length !== 1 ? 's' : ''}`,
      formVisible: false,
      formTitle: 'New Bundle',
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
    state.countLabel = `${all.length} bundle${all.length !== 1 ? 's' : ''}`
  }

  function openCreate() {
    el.querySelector<HTMLInputElement>('#f-name')!.value = ''
    el.querySelector<HTMLInputElement>('#f-description')!.value = ''
    state.editId = ''
    state.formTitle = 'New Bundle'
    state.submitLabel = 'Create'
    state.formError = false
    state.formVisible = true
  }

  async function openEdit(id: string) {
    const bundle = await service.findById(id)
    if (!bundle) return
    el.querySelector<HTMLInputElement>('#f-name')!.value = bundle.name
    el.querySelector<HTMLInputElement>('#f-description')!.value = bundle.description
    state.editId = id
    state.formTitle = 'Edit Bundle'
    state.submitLabel = 'Update'
    state.formError = false
    state.formVisible = true
  }

  el.querySelector('#btn-new-bundle')?.addEventListener('click', openCreate)

  el.querySelector('#btn-cancel')?.addEventListener('click', () => {
    state.formVisible = false
    state.editId = ''
  })

  el.querySelector('#btn-submit')?.addEventListener('click', async () => {
    const name = (el.querySelector<HTMLInputElement>('#f-name')?.value ?? '').trim()
    const description = (el.querySelector<HTMLInputElement>('#f-description')?.value ?? '').trim()

    if (!name) {
      state.formErrorMsg = 'Name is required.'
      state.formError = true
      return
    }

    if (state.editId) {
      await service.update(state.editId as string, { name, description })
    } else {
      await service.create({ name, description, productIds: [] })
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
