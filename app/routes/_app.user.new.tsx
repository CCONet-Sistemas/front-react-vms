import { PageContent, PageHeader } from '~/components/common';
import type { Route } from '../+types/root';
import UserForm from '~/features/user/components/UserForm';
import { useUserPermissions, useUserRolesPermissions } from '~/features/user/hooks/usePermissions';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Novo Usuário | VMS' },
    { name: 'description', content: 'Criar novo usuário - Video Management System' },
  ];
}

export default function NewUserPage() {
  return (
    <PageContent variant="form">
      <PageHeader title="Novo usuário" description="Adicionar novo usuário ao sistema" />
      <UserForm />
    </PageContent>
  );
}
