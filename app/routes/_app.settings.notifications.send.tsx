import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Send, FileCode, CalendarClock } from 'lucide-react';
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
      templateVariables: '',
      scheduledAt: '',
    },
  });

  const onSubmit = useCallback(
    async (formData: SendNotificationFormData) => {
      const dto: SendNotificationDto = {
        channel: formData.channel,
        recipient: formData.recipient,
        subject: formData.subject || undefined,
        body: formData.body,
        priority: formData.priority,
        templateId: formData.templateId,
        templateVariables: formData.templateVariables?.trim()
          ? (JSON.parse(formData.templateVariables) as Record<string, unknown>)
          : undefined,
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
    [sendNotification, navigate]
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
              placeholder="Conteúdo da notificação..."
              disabled={isPending}
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
              <Input
                label="Template ID"
                type="number"
                min={0}
                {...register('templateId', { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                disabled={isPending}
                error={!!errors.templateId}
                helperText={errors.templateId?.message}
              />
              <Textarea
                label="Variáveis do template (JSON)"
                {...register('templateVariables')}
                placeholder={'{\n  "nome": "João",\n  "link": "https://..."\n}'}
                disabled={isPending}
                error={!!errors.templateVariables}
                helperText={errors.templateVariables?.message}
                className="min-h-[120px] font-mono text-xs"
              />
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
