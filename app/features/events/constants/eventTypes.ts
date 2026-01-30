import type { EventStatus } from '~/types';
import type { BadgeProps } from '~/components/ui/badge';
import { Bell, Check, Eye, type LucideIcon } from 'lucide-react';

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  badgeVariant: BadgeProps['variant'];
}

export const statusConfig: Record<EventStatus, StatusConfig> = {
  new: {
    label: 'Novo',
    icon: Bell,
    badgeVariant: 'warning',
  },
  viewed: {
    label: 'Visualizado',
    icon: Eye,
    badgeVariant: 'secondary',
  },
  acknowledged: {
    label: 'Confirmado',
    icon: Check,
    badgeVariant: 'success',
  },
};

export const eventDetection: Record<string, string> = {
  motion: 'Detecção de Movimento',
  tampering: 'Violação de Câmera',
  line_crossing: 'Cruzamento de Linha',
  intrusion: 'Intrusão',
  face_recognition: 'Reconhecimento Facial',
};

export const eventDetectionOptions = Object.entries(eventDetection).map(([value, label]) => ({
  value,
  label,
}));

export const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value: value as EventStatus,
  label: config.label,
}));
