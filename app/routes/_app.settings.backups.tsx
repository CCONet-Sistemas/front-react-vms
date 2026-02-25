import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { BackupSection, RestoreSection } from '~/features/backups';

export function meta() {
  return [
    { title: 'Backup e Restauração | VMS' },
    { name: 'description', content: 'Backup e restauração - Video Management System' },
  ];
}

export default function SettingsBackupPage() {
  return (
    <ProtectedRoute permission="backup:read">
      <PageContent variant="form">
        <div className="space-y-6">
          <PageHeader
            title="Backup e Restauração"
            description="Gerencie backups e restaurações do sistema"
          />

          <Tabs defaultValue="configurations">
            <TabsList>
              <TabsTrigger value="configurations">Configurações</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="configurations">
              <div className="space-y-6">
                <BackupSection />
                <RestoreSection />
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="space-y-6">
                {/* TODO: backup de sistema */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
