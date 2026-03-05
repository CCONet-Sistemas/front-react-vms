import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Badge } from '~/components/ui/badge';
import { NotificationLogStatusBadge } from './NotificationLogStatusBadge';
import type { NotificationLog } from '~/types/notification-log.types';

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

function BodyViewer({ body }: { body: string }) {
  const [mode, setMode] = useState<'source' | 'preview'>('source');
  const hasHtml = isHtml(body);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">Corpo</p>
        {hasHtml && (
          <div className="flex text-xs border rounded overflow-hidden">
            <button
              onClick={() => setMode('source')}
              className={`px-2 py-0.5 transition-colors ${mode === 'source' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
            >
              Código
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-2 py-0.5 transition-colors ${mode === 'preview' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
            >
              Preview
            </button>
          </div>
        )}
      </div>
      {mode === 'source' || !hasHtml ? (
        <pre className="rounded-md bg-muted px-3 py-2 text-xs overflow-auto whitespace-pre-wrap break-words max-h-64">
          {body}
        </pre>
      ) : (
        <div
          className="rounded-md border bg-white px-3 py-2 text-xs overflow-auto max-h-64 prose prose-sm max-w-none"
          // conteúdo interno do servidor — risco de XSS aceitável em painel admin
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
    </div>
  );
}

const channelLabels: Record<string, string> = {
  email: 'E-mail',
  sms: 'SMS',
  push: 'Push',
  webhook: 'Webhook',
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
};

function formatDate(dateString?: string | null): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRecipient(log: NotificationLog): string {
  return (
    log.recipient_email ??
    log.recipient_phone ??
    log.recipient_device_token ??
    log.recipient_webhook_url ??
    '--'
  );
}

interface NotificationLogDetailDialogProps {
  log: NotificationLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationLogDetailDialog({
  log,
  isOpen,
  onClose,
}: NotificationLogDetailDialogProps) {
  if (!log) return null;

  const hasTemplateVariables =
    log.template_variables && Object.keys(log.template_variables).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Notificação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Status + Canal + Prioridade */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <NotificationLogStatusBadge status={log.status} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Canal</p>
              <Badge variant="secondary">{channelLabels[log.channel] ?? log.channel}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
              <p className="font-medium">{priorityLabels[log.priority] ?? log.priority}</p>
            </div>
          </div>

          {/* Destinatário + Assunto */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Destinatário</p>
            <p className="font-medium">{getRecipient(log)}</p>
          </div>

          {log.subject && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assunto</p>
              <p className="font-medium">{log.subject}</p>
            </div>
          )}

          {/* Corpo */}
          <BodyViewer body={log.body} />

          {/* Erro */}
          {log.status === 'failed' && log.error_message && (
            <div>
              <p className="text-xs text-destructive mb-1">Erro</p>
              <p className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-xs whitespace-pre-wrap">
                {log.error_message}
              </p>
            </div>
          )}

          {/* Retries */}
          {(log.retry_count > 0 || log.max_retries > 0) && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tentativas</p>
              <p className="font-medium">
                {log.retry_count} / {log.max_retries}
              </p>
            </div>
          )}

          {/* Disparado por */}
          {log.triggered_by && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Disparado por</p>
                <p className="font-medium">{log.triggered_by}</p>
              </div>
              {log.triggered_by_id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ID origem</p>
                  <p className="font-medium">{log.triggered_by_id}</p>
                </div>
              )}
            </div>
          )}

          {/* Template */}
          {log.template_id != null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Template ID</p>
              <p className="font-medium">{log.template_id}</p>
            </div>
          )}

          {hasTemplateVariables && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Variáveis do template</p>
              <pre className="rounded-md bg-muted px-3 py-2 text-xs overflow-auto">
                {JSON.stringify(log.template_variables, null, 2)}
              </pre>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t pt-3">
            <div>
              <p className="mb-0.5">Criado em</p>
              <p className="text-foreground">{formatDate(log.created_at)}</p>
            </div>
            <div>
              <p className="mb-0.5">Enviado em</p>
              <p className="text-foreground">{formatDate(log.sent_at)}</p>
            </div>
            {log.scheduled_at && (
              <div>
                <p className="mb-0.5">Agendado para</p>
                <p className="text-foreground">{formatDate(log.scheduled_at)}</p>
              </div>
            )}
            {log.failed_at && (
              <div>
                <p className="mb-0.5">Falhou em</p>
                <p className="text-destructive">{formatDate(log.failed_at)}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
