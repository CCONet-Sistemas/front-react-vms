import { Badge } from '~/components/ui/badge';
import type { NotificationTemplateType } from '~/types/notification-template.types';

const channelConfig: Record<NotificationTemplateType, { label: string; className: string }> = {
  email: { label: 'E-mail', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  sms: { label: 'SMS', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  push: { label: 'Push', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  webhook: { label: 'Webhook', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

interface TemplateChannelBadgeProps {
  channel: NotificationTemplateType;
}

export function TemplateChannelBadge({ channel }: TemplateChannelBadgeProps) {
  const config = channelConfig[channel] ?? { label: channel, className: '' };

  return (
    <Badge variant="secondary" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
