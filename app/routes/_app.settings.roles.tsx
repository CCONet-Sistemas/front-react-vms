import type { Route } from './+types/_app.roles';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { RolesList, useRoles } from '~/features/roles';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Perfis de Acesso | VMS' },
    { name: 'description', content: 'Gerenciar perfis de acesso - Video Management System' },
  ];
}

export default function RolesPage() {
  const { data: roles, isLoading, error } = useRoles();
  return (
    <ProtectedRoute resource="role" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Perfis de Acesso"
            description="Gerencie os perfis e permissões do sistema"
            to={'/settings/role'}
            linkText="Novo perfil"
            permission="role:create"
          />

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Erro ao carregar perfis. Tente novamente.</p>
            </div>
          )}

          <RolesList roles={roles || []} isLoading={isLoading} />
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
