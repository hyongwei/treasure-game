import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { token } = useAuth();

  const headers = (extra?: HeadersInit): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  const post = async <T>(url: string, body: unknown): Promise<T> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data as T;
  };

  const get = async <T>(url: string): Promise<T> => {
    const res = await fetch(url, { headers: headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data as T;
  };

  return { post, get };
}
