import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useRouteError, isRouteErrorResponse } from 'react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContent,
  PageHeader,
  ProtectedRoute,
  FilterBar,
  Pagination,
} from '~/components/common';
import { Button } from '~/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import {
  TemplateTable,
  TemplateTestDialog,
  TemplateDefaultsTable,
  TemplateDefaultDetailDialog,
  useNotificationTemplateList,
  useDeleteNotificationTemplate,
  useNotificationTemplateDefaults,
} from '~/features/notification-templates';
import { useListParams } from '~/hooks/useListParams';
import type {
  NotificationTemplate,
  NotificationTemplateType,
  DefaultNotificationTemplate,
} from '~/types/notification-template.types';

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <PageContent>
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Ocorreu um erro inesperado.</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isRouteErrorResponse(error) ? error.statusText : 'Tente novamente mais tarde.'}
        </p>
      </div>
    </PageContent>
  );
}

export function meta() {
  return [
    { title: 'Templates de Notificação | VMS' },
    { name: 'description', content: 'Gerencie templates de notificação - Video Management System' },
  ];
}

export default function SettingsNotificationsTemplatesPage() {
  const navigate = useNavigate();
  const { params, setPage } = useListParams();
  const [searchParams] = useSearchParams();

  const channelFilter = (searchParams.get('channel') as NotificationTemplateType) || undefined;

  const { data: customData, isLoading: isLoadingTemplates } = useNotificationTemplateList({
    page: Number(params.page),
    limit: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
    channel: channelFilter,
  });

  const { data: defaultTemplates = [] } = useNotificationTemplateDefaults();

  const deleteTemplate = useDeleteNotificationTemplate();

  const templates = customData?.data ?? [];
  const total = customData?.meta?.total ?? 0;
  const totalPages = customData?.meta?.last_page ?? 0;

  const [testTemplate, setTestTemplate] = useState<NotificationTemplate | null>(null);
  const [previewDefault, setPreviewDefault] = useState<DefaultNotificationTemplate | null>(null);

  const handleDelete = useCallback(
    async (template: NotificationTemplate) => {
      try {
        await deleteTemplate.mutateAsync(template.uuid);
        toast.success('Template excluído com sucesso!');
      } catch {
        toast.error('Erro ao excluir template');
      }
    },
    [deleteTemplate]
  );

  return (
    <ProtectedRoute permission="notification:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Templates de Notificação"
            description="Crie e gerencie templates reutilizáveis com suporte a variáveis Handlebars"
          >
            <Button onClick={() => navigate('/settings/notifications/templates/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Template
            </Button>
          </PageHeader>

          <Tabs defaultValue="custom">
            <TabsList>
              <TabsTrigger value="custom">Personalizados</TabsTrigger>
              <TabsTrigger value="default">Padrão</TabsTrigger>
            </TabsList>

            {/* ── Personalizados ─────────────────────────────────────── */}
            <TabsContent value="custom">
              <div className="space-y-4">
                <FilterBar
                  placeholder="Buscar templates..."
                  fields={[
                    {
                      type: 'select',
                      key: 'channel',
                      placeholder: 'Todos os canais',
                      options: [
                        { label: 'E-mail', value: 'email' },
                        { label: 'SMS', value: 'sms' },
                        { label: 'Push', value: 'push' },
                        { label: 'Webhook', value: 'webhook' },
                      ],
                    },
                  ]}
                />

                <TemplateTable
                  templates={templates}
                  onEdit={(t) => navigate(`/settings/notifications/templates/${t.uuid}`)}
                  onTest={setTestTemplate}
                  onDelete={handleDelete}
                  isLoading={isLoadingTemplates}
                  isDeleting={deleteTemplate.isPending}
                />

                {totalPages > 0 && (
                  <Pagination
                    page={customData?.meta?.current_page ?? Number(params.page)}
                    totalPages={totalPages}
                    total={total}
                    limit={customData?.meta?.per_page ?? Number(params.per_page)}
                    onPageChange={setPage}
                  />
                )}
              </div>
            </TabsContent>

            {/* ── Padrão (somente leitura) ───────────────────────────── */}
            <TabsContent value="default">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Templates padrão do sistema. Não podem ser editados.
                </p>
                <TemplateDefaultsTable templates={defaultTemplates} onPreview={setPreviewDefault} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <TemplateTestDialog
          template={testTemplate}
          isOpen={!!testTemplate}
          onClose={() => setTestTemplate(null)}
        />

        <TemplateDefaultDetailDialog
          template={previewDefault}
          isOpen={!!previewDefault}
          onClose={() => setPreviewDefault(null)}
        />
      </PageContent>
    </ProtectedRoute>
  );
}
