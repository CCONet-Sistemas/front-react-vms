import { PageContent, PageHeader } from '~/components/common';
import type { Route } from '../+types/root';
import UserForm from '~/features/user/components/UserForm';
import { useUser } from '~/features/users';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Usuários | VMS' },
    { name: 'description', content: 'Gerenciar usuários - Video Management System' },
  ];
}

export default function UserPage({ params }: Route.ComponentProps) {
  const user = useUser(params.uuid || '');

  if (!params.uuid || !user.data) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <PageContent>
      <PageHeader title="Editar usuário" description="Editar usuário na aplicação" />
      <UserForm user={user.data} />
    </PageContent>
  );
}
