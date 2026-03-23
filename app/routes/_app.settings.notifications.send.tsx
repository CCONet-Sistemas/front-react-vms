import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Send, FileCode, CalendarClock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectOption } from '~/components/ui/select';
import { FormSection } from '~/components/ui/form-section';
import { useSendNotification } from '~/features/notification-logs';
import {
  sendNotificationSchema,
  type SendNotificationFormData,
} from '~/features/notification-logs/schemas/send-notification.schema';
import {
  useNotificationTemplateList,
  useNotificationTemplateDefaults,
} from '~/features/notification-templates';
import type { SendNotificationDto } from '~/types/notification-log.types';

export function meta() {
  return [
    { title: 'Enviar Notificação | VMS' },
    { name: 'description', content: 'Enviar notificação manual - Video Management System' },
  ];
}

export default function SendNotificationPage() {
  const navigate = useNavigate();
  const sendNotification = useSendNotification();

  const { data: defaultTemplates = [] } = useNotificationTemplateDefaults();
  const { data: customData } = useNotificationTemplateList({ limit: 1000 });
  const customTemplates = customData?.data ?? [];

  const templateOptions = useMemo(() => {
    const customNames = new Set(customTemplates.map((t) => t.name));
    const defaults = defaultTemplates
      .filter((d) => !customNames.has(d.name) && d.id != null)
      .map((d) => ({ id: d.id!, name: d.name, isDefault: true }));
    const customs = customTemplates
      .filter((t) => t.id != null)
      .map((t) => ({ id: t.id!, name: t.name, isDefault: false }));
    return [...customs, ...defaults].sort((a, b) => a.name.localeCompare(b.name));
  }, [customTemplates, defaultTemplates]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SendNotificationFormData>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      channel: 'email',
      priority: 'normal',
      recipient: '',
      subject: '',
      body: '',
      templateId: undefined,
      templateVariables: [{ key: '', value: '' }],
      scheduledAt: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'templateVariables',
  });

  const watchedBody = useWatch({ control, name: 'body' });
  const watchedTemplateId = useWatch({ control, name: 'templateId' });
  const hasBody = !!watchedBody?.trim();
  const hasTemplate = !!watchedTemplateId;

  const onSubmit = useCallback(
    async (formData: SendNotificationFormData) => {
      const variables = (formData.templateVariables ?? [])
        .filter((r) => r.key.trim())
        .reduce<Record<string, unknown>>((acc, r) => {
          acc[r.key.trim()] = r.value;
          return acc;
        }, {});

      const dto: SendNotificationDto = {
        channel: formData.channel,
        recipient: formData.recipient,
        subject: formData.subject || undefined,
        body: hasTemplate ? undefined : formData.body,
        priority: formData.priority,
        templateId: formData.templateId,
        templateVariables: Object.keys(variables).length > 0 ? variables : undefined,
        scheduledAt: formData.scheduledAt || undefined,
      };

      try {
        await sendNotification.mutateAsync(dto);
        toast.success('Notificação enviada com sucesso!');
        navigate('/settings/notifications');
      } catch {
        toast.error('Erro ao enviar notificação');
      }
    },
    [sendNotification, navigate, hasTemplate]
  );

  const isPending = sendNotification.isPending;

  return (
    <ProtectedRoute permission="notification:read">
      <PageContent variant="form">
        <PageHeader
          title="Enviar Notificação"
          description="Envie uma notificação manual pelo servidor"
        >
          <Button variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </PageHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Envio ─────────────────────────────────────────────────── */}
          <FormSection title="Envio">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Send className="h-4 w-4" />
              <span className="text-xs font-medium">Configurações de envio</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Canal"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isPending}
                    error={!!errors.channel}
                    helperText={errors.channel?.message}
                  >
                    <SelectOption value="email">E-mail</SelectOption>
                    <SelectOption value="sms">SMS</SelectOption>
                    <SelectOption value="push">Push</SelectOption>
                    <SelectOption value="webhook">Webhook</SelectOption>
                  </Select>
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Prioridade"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isPending}
                  >
                    <SelectOption value="low">Baixa</SelectOption>
                    <SelectOption value="normal">Normal</SelectOption>
                    <SelectOption value="high">Alta</SelectOption>
                  </Select>
                )}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Destinatário"
                  {...register('recipient')}
                  placeholder="ex: usuario@email.com"
                  disabled={isPending}
                  error={!!errors.recipient}
                  helperText={errors.recipient?.message}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Assunto (opcional)"
                  {...register('subject')}
                  placeholder="Assunto da notificação"
                  disabled={isPending}
                />
              </div>
            </div>
          </FormSection>

          {/* ── Conteúdo ──────────────────────────────────────────────── */}
          <FormSection title="Conteúdo">
            <Textarea
              label="Corpo da mensagem"
              {...register('body')}
              placeholder={
                hasTemplate
                  ? 'O corpo será definido pelo template selecionado'
                  : 'Conteúdo da notificação...'
              }
              disabled={isPending || hasTemplate}
              error={!!errors.body}
              helperText={errors.body?.message}
              className="min-h-[220px]"
            />
          </FormSection>

          {/* ── Template ──────────────────────────────────────────────── */}
          <FormSection title="Template (opcional)">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <FileCode className="h-4 w-4" />
              <span className="text-xs font-medium">Use um template pré-definido</span>
            </div>
            <div className="grid gap-4">
              <Controller
                name="templateId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Template"
                    value={field.value?.toString() ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={isPending || hasBody}
                    error={!!errors.templateId}
                    helperText={errors.templateId?.message}
                  >
                    <SelectOption value="">Nenhum</SelectOption>
                    {templateOptions.map((t) => (
                      <SelectOption key={t.id} value={t.id.toString()}>
                        {t.name}
                        {t.isDefault ? ' (padrão)' : ''}
                      </SelectOption>
                    ))}
                  </Select>
                )}
              />

              {/* Variáveis do template — chave/valor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Variáveis do template
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ key: '', value: '' })}
                    disabled={isPending || !hasTemplate}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <Input
                      label={i === 0 ? 'Variável' : undefined}
                      {...register(`templateVariables.${i}.key`)}
                      placeholder="nomeVariavel"
                      disabled={isPending || !hasTemplate}
                      className="flex-1"
                    />
                    <Input
                      label={i === 0 ? 'Valor' : undefined}
                      {...register(`templateVariables.${i}.value`)}
                      placeholder="valor"
                      disabled={isPending || !hasTemplate}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(i)}
                      disabled={isPending || !hasTemplate || fields.length === 1}
                      className="text-destructive hover:text-destructive mb-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          {/* ── Agendamento ───────────────────────────────────────────── */}
          <FormSection title="Agendamento (opcional)">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <CalendarClock className="h-4 w-4" />
              <span className="text-xs font-medium">Agende o envio para uma data futura</span>
            </div>
            <Input
              label="Enviar em"
              type="datetime-local"
              {...register('scheduledAt')}
              disabled={isPending}
            />
          </FormSection>

          {/* ── Ações ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/settings/notifications')}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </PageContent>
    </ProtectedRoute>
  );
}
