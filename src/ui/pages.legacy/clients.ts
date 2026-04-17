import { mount } from 'corvuxjs'
import type { CorvuxInstance, ReactiveState } from 'corvuxjs'
import type { ClientService } from '@application/use-cases/ClientService'
import type { Client } from '@core/domain/entities/Client'
import { statusBadge, actionButtons } from '@ui/shared/badges'

function renderRows(clients: Client[]): string {
  if (!clients.length) {
    return `<tr><td colspan="5" class="px-4 py-10 text-center text-sm text-gray-500">No clients yet.</td></tr>`
  }
  return clients.map((c) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
      <td class="px-4 py-3 text-white">${c.name}</td>
      <td class="px-4 py-3 text-gray-300">${c.contact}</td>
      <td class="px-4 py-3 text-gray-400">${c.company}</td>
      <td class="px-4 py-3">${statusBadge(c.status)}</td>
      <td class="px-4 py-3">${actionButtons(c.id, c.status)}</td>
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

export async function mountClientsPage(
  el: HTMLElement,
  service: ClientService,
): Promise<CorvuxInstance<ReactiveState>> {
  const clients = await service.findAll()

  const app = mount({
    el,
    state: {
      rowsHtml: renderRows(clients),
      countLabel: `${clients.length} client${clients.length !== 1 ? 's' : ''}`,
      formVisible: false,
      formTitle: 'New Client',
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
    state.countLabel = `${all.length} client${all.length !== 1 ? 's' : ''}`
  }

  function openCreate() {
    el.querySelector<HTMLInputElement>('#f-name')!.value = ''
    el.querySelector<HTMLInputElement>('#f-contact')!.value = ''
    el.querySelector<HTMLInputElement>('#f-company')!.value = ''
    state.editId = ''
    state.formTitle = 'New Client'
    state.submitLabel = 'Create'
    state.formError = false
    state.formVisible = true
  }

  async function openEdit(id: string) {
    const client = await service.findById(id)
    if (!client) return
    el.querySelector<HTMLInputElement>('#f-name')!.value = client.name
    el.querySelector<HTMLInputElement>('#f-contact')!.value = client.contact
    el.querySelector<HTMLInputElement>('#f-company')!.value = client.company
    state.editId = id
    state.formTitle = 'Edit Client'
    state.submitLabel = 'Update'
    state.formError = false
    state.formVisible = true
  }

  el.querySelector('#btn-new-client')?.addEventListener('click', openCreate)

  el.querySelector('#btn-cancel')?.addEventListener('click', () => {
    state.formVisible = false
    state.editId = ''
  })

  el.querySelector('#btn-submit')?.addEventListener('click', async () => {
    const name = (el.querySelector<HTMLInputElement>('#f-name')?.value ?? '').trim()
    const contact = (el.querySelector<HTMLInputElement>('#f-contact')?.value ?? '').trim()
    const company = (el.querySelector<HTMLInputElement>('#f-company')?.value ?? '').trim()

    if (!name || !contact) {
      state.formErrorMsg = 'Name and contact are required.'
      state.formError = true
      return
    }

    if (state.editId) {
      await service.update(state.editId as string, { name, contact, company })
    } else {
      await service.create({ name, contact, company })
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
