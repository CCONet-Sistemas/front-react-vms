import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import type { SearchParams } from '~/types';

interface UseListParamsOptions {
  defaults?: Partial<SearchParams>;
}

interface UseListParamsReturn {
  params: SearchParams;
  setSearch: (search: string | undefined) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSort: (sort: string | undefined) => void;
  setOrder: (order: 'asc' | 'desc') => void;
  clearFilters: () => void;
}

export function useListParams(options?: UseListParamsOptions): UseListParamsReturn {
  const { defaults = {} } = options ?? {};
  const [searchParams, setSearchParams] = useSearchParams();

  const params: SearchParams = {
    search: searchParams.get('search') ?? defaults.search,
    page: Number(searchParams.get('page')) || defaults.page || 1,
    per_page: Number(searchParams.get('per_page')) || defaults.per_page || 10,
    sort: searchParams.get('sort') ?? defaults.sort,
    order: (searchParams.get('order') as 'asc' | 'desc') ?? defaults.order,
  };

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = false) => {
      const newParams = new URLSearchParams(searchParams);

      if (resetPage) {
        newParams.set('page', '1');
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const setSearch = useCallback(
    (search: string | undefined) => {
      updateParams({ search }, true);
    },
    [updateParams]
  );

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page: String(page) });
    },
    [updateParams]
  );

  const setPerPage = useCallback(
    (perPage: number) => {
      updateParams({ per_page: String(perPage) }, true);
    },
    [updateParams]
  );

  // Ao definir o sort, reseta a ordem para 'asc' se ainda não havia ordem.
  // Ao limpar o sort (undefined), também remove a ordem.
  const setSort = useCallback(
    (sort: string | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (sort) {
        newParams.set('sort', sort);
        if (!newParams.get('order')) {
          newParams.set('order', 'asc');
        }
      } else {
        newParams.delete('sort');
        newParams.delete('order');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const setOrder = useCallback(
    (order: 'asc' | 'desc') => {
      updateParams({ order });
    },
    [updateParams]
  );

  // Limpa search, sort e order; reseta page para 1. Mantém per_page.
  const clearFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('sort');
    newParams.delete('order');
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return { params, setSearch, setPage, setPerPage, setSort, setOrder, clearFilters };
}
