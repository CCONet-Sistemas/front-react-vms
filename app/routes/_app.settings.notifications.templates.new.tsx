import { TemplateFormPage } from '~/features/notification-templates/components/TemplateFormPage';

export function meta() {
  return [
    { title: 'Novo Template de Notificação | VMS' },
    { name: 'description', content: 'Criar template de notificação - Video Management System' },
  ];
}

export default function NotificationTemplateNewPage() {
  return <TemplateFormPage />;
}
