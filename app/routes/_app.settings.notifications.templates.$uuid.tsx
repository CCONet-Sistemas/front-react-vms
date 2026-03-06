import { useParams } from 'react-router';
import { TemplateFormPage } from '~/features/notification-templates/components/TemplateFormPage';
import { useNotificationTemplate } from '~/features/notification-templates';
import { PageContent } from '~/components/common';

export function meta() {
  return [
    { title: 'Editar Template | VMS' },
    { name: 'description', content: 'Editar template de notificação - Video Management System' },
  ];
}

export default function NotificationTemplateEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: template, isLoading } = useNotificationTemplate(uuid ?? '');

  if (isLoading) {
    return (
      <PageContent variant="form">
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Carregando template...
        </div>
      </PageContent>
    );
  }

  return <TemplateFormPage template={template} />;
}
