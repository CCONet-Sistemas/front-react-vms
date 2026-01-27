import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/_app.users';
import { toast } from 'sonner';
import { PageContent, PageHeader, Pagination, ProtectedRoute } from '~/components/common';
import {
  UserFilters,
  UserFormDialog,
  UsersTable,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '~/features/users';
import type { User, UserFilters as UserFiltersType, CreateUserDto, UpdateUserDto } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Usuários | VMS' },
    { name: 'description', content: 'Gerenciar usuários - Video Management System' },
  ];
}

const DEFAULT_LIMIT = 10;

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Get params from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const search = searchParams.get('search') || undefined;
  const activeOnly = searchParams.get('activeOnly') === 'true' || undefined;

  // Filters state derived from URL
  const filters: UserFiltersType = { search, activeOnly };

  // Queries and mutations
  const { data, isLoading, error } = useUsers({ page, limit, search, activeOnly });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const users = data ?? ([] as User[]);
  const meta = data?.meta;

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

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

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ limit: String(newLimit), page: '1' });
  };

  const handleFilterChange = (newFilters: UserFiltersType) => {
    updateParams({
      search: newFilters.search,
      activeOnly: newFilters.activeOnly ? 'true' : undefined,
      page: '1', // Reset to first page when filters change
    });
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (formData: CreateUserDto | UpdateUserDto) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ uuid: editingUser.uuid, data: formData as UpdateUserDto });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await createUser.mutateAsync(formData as CreateUserDto);
        toast.success('Usuário criado com sucesso!');
      }
      handleCloseForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro';
      toast.error(editingUser ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário', {
        description: message,
      });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser.mutateAsync(user.uuid);
      toast.success('Usuário excluído com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro';
      toast.error('Erro ao excluir usuário', { description: message });
    }
  };

  const isSubmitting = createUser.isPending || updateUser.isPending;

  return (
    <ProtectedRoute resource="user" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          {/* Header */}

          <PageHeader
            title="Usuários"
            description="Gerencie os usuários do sistema"
            to="/user/new"
            linkText="Novo usuário"
            permission="user:create"
          />

          {/* Filters */}
          <UserFilters filters={filters} onFilterChange={handleFilterChange} />

          {/* Error state */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Erro ao carregar usuários. Tente novamente.
              </p>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Carregando usuários...</div>
            </div>
          ) : (
            <>
              {/* Table */}
              <UsersTable
                users={users}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                isDeleting={deleteUser.isPending}
              />

              {/* Pagination */}
              {meta && meta.totalPages > 0 && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </>
          )}
        </div>

        {/* Form Dialog */}
        <UserFormDialog
          user={editingUser}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </PageContent>
    </ProtectedRoute>
  );
}
