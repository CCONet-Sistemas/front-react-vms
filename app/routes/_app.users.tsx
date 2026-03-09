import { useState, useCallback } from 'react';
import { useSearchParams, useRouteError, isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/_app.users';
import { toast } from 'sonner';
import { PageContent, PageHeader, Pagination, ProtectedRoute, FilterBar } from '~/components/common';
import { TableSkeleton } from '~/components/ui/table-skeleton';
import {
  UserFilters,
  UserFormDialog,
  UsersTable,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '~/features/users';
import { useListParams } from '~/hooks/useListParams';
import type { User, UserFilters as UserFiltersType, CreateUserDto, UpdateUserDto } from '~/types';

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <PageContent>
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Ocorreu um erro inesperado.</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isRouteErrorResponse(error) ? error.statusText : 'Tente novamente mais tarde.'}
        </p>
      </div>
    </PageContent>
  );
}

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Usuários | VMS' },
    { name: 'description', content: 'Gerenciar usuários - Video Management System' },
  ];
}

export default function UsersPage() {
  const { params, setPage } = useListParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const activeOnly = searchParams.get('activeOnly') === 'true' || undefined;
  const userFilters: UserFiltersType = { activeOnly };

  const { data, isLoading, error } = useUsers({
    page: Number(params.page),
    per_page: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
    activeOnly,
  });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const users = data?.data ?? ([] as User[]);
  const meta = data?.meta;

  const handleFilterChange = useCallback(
    (newFilters: UserFiltersType) => {
      const newParams = new URLSearchParams(searchParams);
      if (newFilters.activeOnly) {
        newParams.set('activeOnly', 'true');
      } else {
        newParams.delete('activeOnly');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

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
          <PageHeader
            title="Usuários"
            description="Gerencie os usuários do sistema"
            to="/user/new"
            linkText="Novo usuário"
            permission="user:create"
          />

          <div className="flex flex-wrap items-center gap-4">
            <FilterBar
              placeholder="Buscar por nome ou email..."
              sortOptions={[
                { label: 'Nome', value: 'name' },
                { label: 'Email', value: 'email' },
                { label: 'Data', value: 'createdAt' },
              ]}
              className="flex-1"
            />
            <UserFilters filters={userFilters} onFilterChange={handleFilterChange} />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Erro ao carregar usuários. Tente novamente.
              </p>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : (
            <>
              <UsersTable
                users={users}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                isDeleting={deleteUser.isPending}
              />

              {meta && meta.last_page > 0 && (
                <Pagination
                  page={meta.current_page}
                  totalPages={meta.last_page}
                  total={meta.total}
                  limit={meta.per_page}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>

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
