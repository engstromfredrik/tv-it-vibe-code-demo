const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface GS1Link {
  id: string
  gs1Key: string
  gs1KeyType: string
  targetUrl: string
  linkType: string
  title: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateLinkInput = Omit<GS1Link, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateLinkInput = Partial<CreateLinkInput>

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  listLinks: () => request<GS1Link[]>('/links'),
  getLink: (id: string) => request<GS1Link>(`/links/${id}`),
  createLink: (data: CreateLinkInput) =>
    request<GS1Link>('/links', { method: 'POST', body: JSON.stringify(data) }),
  updateLink: (id: string, data: UpdateLinkInput) =>
    request<GS1Link>(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLink: (id: string) =>
    request<void>(`/links/${id}`, { method: 'DELETE' }),
}
