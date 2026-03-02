import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { EventsSyncSection } from '~/features/sync';

export function meta() {
  return [
    { title: 'Sincronização | VMS' },
    { name: 'description', content: 'Sincronização de dados - Video Management System' },
  ];
}

export default function SettingsSyncPage() {
  return (
    <ProtectedRoute permission="event:read">
      <PageContent variant="form">
        <div className="space-y-6">
          <PageHeader
            title="Sincronização"
            description="Sincronize dados do VMS manualmente ou automaticamente."
          />
          <EventsSyncSection />
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
