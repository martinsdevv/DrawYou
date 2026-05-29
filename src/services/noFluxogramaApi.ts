import { apiUrl } from '../config/api'
import type {
  IApiErro,
  IDashboardApi,
  INoFluxograma,
  INoFluxogramaPayload,
} from '../types/noFluxograma'

const parseErro = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as IApiErro
    return body.mensagem ?? `Erro HTTP ${response.status}`
  } catch {
    return `Erro HTTP ${response.status}`
  }
}

const request = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(await parseErro(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const noFluxogramaApi = {
  listar: () => request<INoFluxograma[]>(apiUrl('/api/nos')),

  buscarPorId: (id: number) => request<INoFluxograma>(apiUrl(`/api/nos/${id}`)),

  cadastrar: (payload: INoFluxogramaPayload) =>
    request<INoFluxograma>(apiUrl('/api/nos'), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  atualizar: (id: number, payload: INoFluxogramaPayload) =>
    request<INoFluxograma>(apiUrl(`/api/nos/${id}`), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  excluir: (id: number) =>
    request<void>(apiUrl(`/api/nos/${id}`), {
      method: 'DELETE',
    }),

  dashboard: () => request<IDashboardApi>(apiUrl('/api/dashboard')),
}
