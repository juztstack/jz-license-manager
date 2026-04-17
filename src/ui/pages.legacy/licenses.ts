import { mount } from '@corvux/core'
import type { CorvuxInstance, ReactiveState } from '@corvux/core'
import type { LicenseService } from '@application/use-cases/LicenseService'
import type { License } from '@core/domain/entities/License'
import { createLicenseId } from '@core/domain/value-objects/LicenseId'

const STATUS_CLS: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  inactive: 'bg-gray-700 text-gray-300',
  expired: 'bg-yellow-900/60 text-yellow-300',
  revoked: 'bg-red-900/60 text-red-300',
}

function licenseActions(id: string, status: string): string {
  const revoke = status === 'active'
    ? `<button data-action="revoke" data-id="${id}" class="text-yellow-400 hover:text-yellow-300 text-xs transition-colors mr-3">Revoke</button>`
    : ''
  return `
    <button data-action="edit" data-id="${id}" class="text-indigo-400 hover:text-indigo-300 text-xs transition-colors mr-3">Edit</button>
    ${revoke}
    <button data-action="delete" data-id="${id}" class="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
  `
}

function renderRows(licenses: License[]): string {
  if (!licenses.length) {
    return `<tr>
      <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">
        No licenses yet. <a href="/licenses/new" class="text-indigo-400 hover:text-indigo-300">Create one →</a>
      </td>
    </tr>`
  }
  return licenses.map((l) => `
    <tr class="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
      <td class="px-4 py-3 font-mono text-xs text-gray-300">${l.key}</td>
      <td class="px-4 py-3 text-white">${l.productName}</td>
      <td class="px-4 py-3 text-gray-300">${l.assignedTo}</td>
      <td class="px-4 py-3">
        <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLS[l.status] ?? ''}">
          ${l.status}
        </span>
      </td>
      <td class="px-4 py-3 text-gray-400 text-xs">
        ${l.expiresAt ? l.expiresAt.toLocaleDateString() : '—'}
      </td>
      <td class="px-4 py-3">${licenseActions(l.id, l.status)}</td>
    </tr>
  `).join('')
}

type PageState = {
  licensesHtml: string
  countLabel: string
  formVisible: boolean
  editId: string
  [key: string]: unknown
}

export async function mountLicensesPage(
  el: HTMLElement,
  service: LicenseService,
): Promise<CorvuxInstance<ReactiveState>> {
  const licenses = await service.listLicenses()

  const app = mount({
    el,
    state: {
      licensesHtml: renderRows(licenses),
      countLabel: `${licenses.length} license${licenses.length !== 1 ? 's' : ''}`,
      formVisible: false,
      editId: '',
    } satisfies PageState,
  })

  const state = app.state as PageState

  async function refresh() {
    const all = await service.listLicenses()
    state.licensesHtml = renderRows(all)
    state.countLabel = `${all.length} license${all.length !== 1 ? 's' : ''}`
  }

  async function openEdit(id: string) {
    const license = await service.getLicense(createLicenseId(id))
    if (!license) return
    el.querySelector<HTMLInputElement>('#f-product')!.value = license.productName
    el.querySelector<HTMLInputElement>('#f-assigned')!.value = license.assignedTo
    el.querySelector<HTMLInputElement>('#f-expires')!.value = license.expiresAt
      ? license.expiresAt.toISOString().split('T')[0]
      : ''
    state.editId = id
    state.formVisible = true
  }

  el.querySelector('#btn-cancel')?.addEventListener('click', () => {
    state.formVisible = false
    state.editId = ''
  })

  el.querySelector('#btn-submit')?.addEventListener('click', async () => {
    const productName = (el.querySelector<HTMLInputElement>('#f-product')?.value ?? '').trim()
    const assignedTo = (el.querySelector<HTMLInputElement>('#f-assigned')?.value ?? '').trim()
    const expiresRaw = el.querySelector<HTMLInputElement>('#f-expires')?.value ?? ''

    if (!productName || !assignedTo) return

    await service.updateLicense(createLicenseId(state.editId as string), {
      productName,
      assignedTo,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
    })

    state.formVisible = false
    state.editId = ''
    await refresh()
  })

  app.watch('licensesHtml', () => bindActions())

  function bindActions() {
    el.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id!
        const action = btn.dataset.action!
        if (action === 'edit') { await openEdit(id); return }
        if (action === 'revoke') await service.revokeLicense(createLicenseId(id))
        if (action === 'delete') await service.deleteLicense(createLicenseId(id))
        await refresh()
      })
    })
  }

  bindActions()
  return app
}
