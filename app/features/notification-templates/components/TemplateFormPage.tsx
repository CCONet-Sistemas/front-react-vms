import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectOption } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { FormSection } from '~/components/ui/form-section';
import { templateSchema, type TemplateFormData } from '../schemas/template.schema';
import { HandlebarsEditor } from './HandlebarsEditor';
import { TemplatePreviewPanel } from './TemplatePreviewPanel';
import { TemplateVariablesPanel } from './TemplateVariablesPanel';
import {
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  useNotificationTemplateDefaults,
} from '../hooks/useNotificationTemplate';
import type { NotificationTemplate } from '~/types/notification-template.types';

interface TemplateFormPageProps {
  template?: NotificationTemplate;
}

export function TemplateFormPage({ template }: TemplateFormPageProps) {
  const isEditing = !!template;
  const navigate = useNavigate();
  const createTemplate = useCreateNotificationTemplate();
  const updateTemplate = useUpdateNotificationTemplate();
  const { data: defaultTemplates = [] } = useNotificationTemplateDefaults();
  const [nameMode, setNameMode] = useState<'custom' | 'default'>('custom');
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      channel: 'email',
      subjectTemplate: '',
      bodyTemplate: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description ?? '',
        channel: template.channel,
        subjectTemplate: template.subject_template ?? '',
        bodyTemplate: template.body_template,
        isActive: template.is_active,
      });
    }
  }, [template, reset]);

  const watchedChannel = watch('channel');
  const watchedBody = watch('bodyTemplate') ?? '';

  const bodyVariables = [
    ...new Set([...watchedBody.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].trim())),
  ];

  const isSubmitting = createTemplate.isPending || updateTemplate.isPending;

  const onSubmit = async (formData: TemplateFormData) => {
    try {
      if (isEditing) {
        await updateTemplate.mutateAsync({ uuid: template.uuid, dto: formData });
        toast.success('Template atualizado com sucesso!');
      } else {
        await createTemplate.mutateAsync(formData);
        toast.success('Template criado com sucesso!');
      }
      navigate('/settings/notifications/templates');
    } catch {}
  };

  return (
    <ProtectedRoute permission="notification:read">
      <PageContent variant="form">
        <PageHeader
          title={isEditing ? `Editar Template: ${template.name}` : 'Novo Template de Notificação'}
          description={
            isEditing
              ? 'Edite o conteúdo e as configurações do template'
              : 'Crie um template reutilizável com suporte a variáveis Handlebars'
          }
        >
          <Button
            variant="outline"
            onClick={() => navigate('/settings/notifications/templates')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </PageHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Identificação ─────────────────────────────────────────── */}
          <FormSection title="Identificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium mr-2">Nome</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNameMode('custom')}
                    tooltip
                    tooltipText="Digite um nome livre para o template"
                    className={`rounded-full px-3 py-0.5 h-auto text-xs font-medium border ${
                      nameMode === 'custom'
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                        : 'bg-transparent text-muted-foreground border-border'
                    }`}
                  >
                    Personalizado
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNameMode('default')}
                    tooltip
                    tooltipText="Selecione um nome a partir dos templates padrão do sistema"
                    className={`rounded-full px-3 py-0.5 h-auto text-xs font-medium border ${
                      nameMode === 'default'
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                        : 'bg-transparent text-muted-foreground border-border'
                    }`}
                  >
                    Padrão
                  </Button>
                </div>

                {nameMode === 'custom' ? (
                  <Input
                    {...register('name')}
                    placeholder="Nome do template"
                    disabled={isSubmitting}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                ) : (
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSubmitting}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      >
                        <SelectOption value="">Selecione um template padrão</SelectOption>
                        {defaultTemplates.map((t) => (
                          <SelectOption key={t.name} value={t.name}>
                            {t.name}
                          </SelectOption>
                        ))}
                      </Select>
                    )}
                  />
                )}
              </div>

              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Canal"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <SelectOption value="email">E-mail</SelectOption>
                    <SelectOption value="sms">SMS</SelectOption>
                    <SelectOption value="push">Push</SelectOption>
                    <SelectOption value="webhook">Webhook</SelectOption>
                  </Select>
                )}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Descrição"
                  {...register('description')}
                  placeholder="Descrição opcional do template"
                  disabled={isSubmitting}
                />
              </div>

              {watchedChannel === 'email' && (
                <div className="sm:col-span-2">
                  <Input
                    label="Assunto"
                    {...register('subjectTemplate')}
                    placeholder="Assunto do e-mail (suporta {{variavel}})"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="sm:col-span-2 flex items-center justify-between">
                <span className="text-sm font-medium">Template ativo</span>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </div>
          </FormSection>

          {/* ── Editor + Preview ───────────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <FormSection title="Corpo do template">
              <div className="space-y-4">
                <Controller
                  name="bodyTemplate"
                  control={control}
                  render={({ field }) => (
                    <HandlebarsEditor
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.bodyTemplate}
                      helperText={errors.bodyTemplate?.message}
                      rows={16}
                    />
                  )}
                />
                <TemplateVariablesPanel />
              </div>
            </FormSection>

            <FormSection title="Preview">
              <div className="space-y-4">
                <TemplatePreviewPanel body={watchedBody} variables={previewVariables} />

                {bodyVariables.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Preencha as variáveis para visualizar o preview:
                    </p>
                    {bodyVariables.map((varName) => (
                      <Input
                        key={varName}
                        label={`{{${varName}}}`}
                        value={previewVariables[varName] ?? ''}
                        onChange={(e) =>
                          setPreviewVariables((prev) => ({ ...prev, [varName]: e.target.value }))
                        }
                        placeholder={`Valor para ${varName}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </FormSection>
          </div>

          {/* ── Ações ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Criar Template'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/settings/notifications/templates')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </PageContent>
    </ProtectedRoute>
  );
}
