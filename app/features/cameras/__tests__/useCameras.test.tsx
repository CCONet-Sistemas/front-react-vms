import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { useCameras } from '~/features/cameras/hooks/useCameras';
import { server } from '~/test/server';
import { createTestQueryClient } from '~/test/utils';
import { mockCamera } from '~/test/handlers/cameras';

// Wrapper com QueryClient isolado por teste (retry desativado para testes rápidos)
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// Exemplo de testes de integração: hook + MSW interceptando a API real
describe('useCameras', () => {
  it('retorna lista de câmeras com sucesso', async () => {
    const { result } = renderHook(() => useCameras(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].name).toBe(mockCamera.name);
    expect(result.current.data?.meta.total).toBe(1);
  });

  it('começa no estado de carregamento', () => {
    const { result } = renderHook(() => useCameras(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('suporta parâmetros de busca', async () => {
    const { result } = renderHook(() => useCameras({ search: 'entrada', page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toBeDefined();
  });

  it('trata erro 500 da API', async () => {
    // Sobrescreve o handler padrão apenas para este teste
    server.use(
      http.get('http://localhost:3000/camera', () => {
        return HttpResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useCameras(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('trata erro 404 da API', async () => {
    server.use(
      http.get('http://localhost:3000/camera', () => {
        return HttpResponse.json({ message: 'Não encontrado' }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useCameras(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
