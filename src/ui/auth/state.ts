let authenticated = false

export const authState = {
  isAuthenticated: (): boolean => authenticated,
  login: (): void => { authenticated = true },
  logout: (): void => { authenticated = false },
}
