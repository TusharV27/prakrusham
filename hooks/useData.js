import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useProducts(query = '') {
  const rawQuery = query.startsWith('?') ? query.slice(1) : query;
  const normalizedQuery = rawQuery.includes('status=')
    ? rawQuery
    : `status=ACTIVE${rawQuery ? `&${rawQuery}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    `/api/products?${normalizedQuery}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    products: data?.success ? data.data : [],
    total: data?.pagination?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    categories: data?.success ? data.data : [],
    isLoading,
    isError: error,
    mutate,
  };
}
