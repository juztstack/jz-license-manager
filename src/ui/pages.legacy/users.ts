import { mount } from '@corvux/core'
import type { CorvuxInstance, ReactiveState } from '@corvux/core'
import type { UserService } from '@application/use-cases/UserService'
import type { User } from '@core/domain/entities/User'
import { statusBadge, actionButtons } from '@ui/shared/badges'

function renderRows(users: User[]): string {
  if (!users.length) {
    return `<tr><td colspan="5" class="px-4 py-10 text-center text-sm text-gray-500">No users yet.</td></tr>`
  }
  return users.map((u) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
      <td class="px-4 py-3 text-white">${u.name}</td>
      <td class="px-4 py-3 text-gray-300">${u.email}</td>
      <td class="px-4 py-3 text-gray-300 capitalize">${u.role}</td>
      <td class="px-4 py-3">${statusBadge(u.status)}</td>
      <td class="px-4 py-3">${actionButtons(u.id, u.status)}</td>
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

export async function mountUsersPage(
  el: HTMLElement,
  service: UserService,
): Promise<CorvuxInstance<ReactiveState>> {
  const users = await service.findAll()

  const app = mount({
    el,
    state: {
      rowsHtml: renderRows(users),
      countLabel: `${users.length} user${users.length !== 1 ? 's' : ''}`,
      formVisible: false,
      formTitle: 'New User',
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
    state.countLabel = `${all.length} user${all.length !== 1 ? 's' : ''}`
  }

  function openCreate() {
    el.querySelector<HTMLInputElement>('#f-name')!.value = ''
    el.querySelector<HTMLInputElement>('#f-email')!.value = ''
    el.querySelector<HTMLSelectElement>('#f-role')!.value = 'viewer'
    state.editId = ''
    state.formTitle = 'New User'
    state.submitLabel = 'Create'
    state.formError = false
    state.formVisible = true
  }

  async function openEdit(id: string) {
    const user = await service.findById(id)
    if (!user) return
    el.querySelector<HTMLInputElement>('#f-name')!.value = user.name
    el.querySelector<HTMLInputElement>('#f-email')!.value = user.email
    el.querySelector<HTMLSelectElement>('#f-role')!.value = user.role
    state.editId = id
    state.formTitle = 'Edit User'
    state.submitLabel = 'Update'
    state.formError = false
    state.formVisible = true
  }

  el.querySelector('#btn-new-user')?.addEventListener('click', openCreate)

  el.querySelector('#btn-cancel')?.addEventListener('click', () => {
    state.formVisible = false
    state.editId = ''
  })

  el.querySelector('#btn-submit')?.addEventListener('click', async () => {
    const name = (el.querySelector<HTMLInputElement>('#f-name')?.value ?? '').trim()
    const email = (el.querySelector<HTMLInputElement>('#f-email')?.value ?? '').trim()
    const role = (el.querySelector<HTMLSelectElement>('#f-role')?.value ?? 'viewer') as 'admin' | 'viewer'

    if (!name || !email) {
      state.formErrorMsg = 'Name and email are required.'
      state.formError = true
      return
    }

    if (state.editId) {
      await service.update(state.editId as string, { name, email, role })
    } else {
      await service.create({ name, email, role })
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
