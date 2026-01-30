import { useParams } from 'react-router';
import type { Route } from './+types/_app.role.$id';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { RoleForm, useRole } from '~/features/roles';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Editar Perfil | VMS' },
    { name: 'description', content: 'Editar perfil de acesso - Video Management System' },
  ];
}

export default function EditRolePage() {
  const { id } = useParams();
  const roleId = Number(id);
  const { data: role, isLoading, error } = useRole(roleId);

  if (isLoading) {
    return (
      <PageContent variant="form">
        <PageHeader title="Editar Perfil" description="Carregando..." />
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Carregando perfil...</div>
        </div>
      </PageContent>
    );
  }

  if (error || !role) {
    return (
      <PageContent variant="form">
        <PageHeader title="Editar Perfil" description="Erro ao carregar perfil" />
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Perfil não encontrado ou erro ao carregar dados.
          </p>
        </div>
      </PageContent>
    );
  }

  return (
    <ProtectedRoute resource="role" action="update">
      <PageContent variant="form">
        <PageHeader
          title="Editar Perfil"
          description={`Editando: ${role.name}`}
        />
        <RoleForm role={role} />
      </PageContent>
    </ProtectedRoute>
  );
}
