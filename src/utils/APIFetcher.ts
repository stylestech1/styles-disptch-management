export const apiFetcher = async (url: string, options: RequestInit) => {
  const res = await fetch(url, options);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Request failed");
  return result;
};
