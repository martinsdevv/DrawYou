export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/draw-you-api'

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`
