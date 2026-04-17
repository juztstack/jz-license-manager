export function statusBadge(status: string): string {
  const cls = status === 'active'
    ? 'bg-green-900/60 text-green-300'
    : 'bg-gray-700 text-gray-400'
  return `<span class="inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}">${status}</span>`
}

export function actionButtons(id: string, status: string): string {
  const toggleLabel = status === 'active' ? 'Deactivate' : 'Activate'
  const toggleCls = status === 'active'
    ? 'text-yellow-400 hover:text-yellow-300'
    : 'text-green-400 hover:text-green-300'
  return `
    <button data-action="edit" data-id="${id}" class="text-indigo-400 hover:text-indigo-300 text-xs transition-colors mr-3">Edit</button>
    <button data-action="toggle" data-id="${id}" class="${toggleCls} text-xs transition-colors mr-3">${toggleLabel}</button>
    <button data-action="delete" data-id="${id}" class="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
  `
}
