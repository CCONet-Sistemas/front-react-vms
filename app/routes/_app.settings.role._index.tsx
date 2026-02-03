import type { Route } from './+types/_app.role.new';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { RoleForm } from '~/features/roles';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Novo Perfil | VMS' },
    { name: 'description', content: 'Criar novo perfil de acesso - Video Management System' },
  ];
}

export default function NewRolePage() {
  return (
    <ProtectedRoute resource="role" action="create">
      <PageContent variant="form">
        <PageHeader title="Novo Perfil" description="Criar novo perfil de acesso" />
        <RoleForm />
      </PageContent>
    </ProtectedRoute>
  );
}
