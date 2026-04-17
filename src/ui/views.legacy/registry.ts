import { createViewManager } from 'corvuxjs'

export const viewManager = createViewManager()

viewManager.register('login', {
  src: '/views/login.html',
  meta: { title: 'Sign In — JZ License Manager' },
})

viewManager.register('licenses', {
  src: '/views/licenses.html',
  meta: { title: 'Licenses — JZ License Manager' },
})

viewManager.register('license-new', {
  src: '/views/license-new.html',
  meta: { title: 'New License — JZ License Manager' },
})

viewManager.register('users', {
  src: '/views/users.html',
  meta: { title: 'Users — JZ License Manager' },
})

viewManager.register('products', {
  src: '/views/products.html',
  meta: { title: 'Products — JZ License Manager' },
})

viewManager.register('bundles', {
  src: '/views/bundles.html',
  meta: { title: 'Bundles — JZ License Manager' },
})

viewManager.register('clients', {
  src: '/views/clients.html',
  meta: { title: 'Clients — JZ License Manager' },
})

viewManager.register('not-found', {
  src: '/views/not-found.html',
  meta: { title: '404 — JZ License Manager' },
})
