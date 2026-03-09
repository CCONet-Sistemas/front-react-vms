import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { BackupSection, RestoreSection } from '~/features/backups';

export function meta() {
  return [
    { title: 'Configurações de Backup | VMS' },
    {
      name: 'description',
      content: 'Backup e restauração de configurações - Video Management System',
    },
  ];
}

export default function SettingsBackupsConfigPage() {
  return (
    <ProtectedRoute permission="backup:read">
      <PageContent variant="form">
        <div className="space-y-6">
          <PageHeader
            title="Configurações de Backup"
            description="Gere e restaure backups das configurações do sistema"
          />
          <BackupSection />
          <RestoreSection />
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
