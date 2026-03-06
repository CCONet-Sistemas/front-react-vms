import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { TemplateChannelBadge } from './TemplateChannelBadge';
import type { DefaultNotificationTemplate } from '~/types/notification-template.types';

interface TemplateDefaultDetailDialogProps {
  template: DefaultNotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateDefaultDetailDialog({
  template,
  isOpen,
  onClose,
}: TemplateDefaultDetailDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Template Padrão</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nome</p>
            <p className="font-mono font-medium">{template.name}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Canal</p>
            <TemplateChannelBadge channel={template.channel} />
          </div>

          {template.description && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Descrição</p>
              <p>{template.description}</p>
            </div>
          )}

          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Este é um template padrão do sistema e não pode ser editado.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
