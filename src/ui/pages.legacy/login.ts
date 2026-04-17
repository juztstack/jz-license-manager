import { mount } from '@corvux/core'
import type { CorvuxInstance, ReactiveState } from '@corvux/core'
import { authState } from '@ui/auth/state'

interface RouterInstance {
  navigate(path: string): void
}

type LoginState = {
  email: string
  password: string
  errorVisible: boolean
  errorMsg: string
  [key: string]: unknown
}

export async function mountLoginPage(
  el: HTMLElement,
  router: RouterInstance,
): Promise<CorvuxInstance<ReactiveState>> {
  const app = mount({
    el,
    state: {
      email: '',
      password: '',
      errorVisible: false,
      errorMsg: '',
    } satisfies LoginState,
  })

  const state = app.state as LoginState

  const bindInput = (id: string, key: keyof LoginState) => {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)
    if (!input) return
    input.addEventListener('input', () => { state[key] = input.value })
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') el.querySelector<HTMLButtonElement>('#btn-login')?.click()
    })
  }

  bindInput('input-email', 'email')
  bindInput('input-password', 'password')

  el.querySelector('#btn-login')?.addEventListener('click', () => {
    const email = String(state.email).trim()
    const password = String(state.password).trim()

    if (!email || !password) {
      state.errorMsg = 'Email and password are required.'
      state.errorVisible = true
      return
    }

    // Placeholder auth — replace with real API call
    if (email === 'admin@example.com' && password === 'admin') {
      authState.login()
      router.navigate('/licenses')
    } else {
      state.errorMsg = 'Invalid credentials.'
      state.errorVisible = true
    }
  })

  return app
}
