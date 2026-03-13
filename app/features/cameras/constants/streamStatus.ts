import { Video, VideoOff, AlertCircle, Pause } from 'lucide-react';
import type { StreamState } from '~/types';
import type { LucideIcon } from 'lucide-react';

export interface StreamStatusConfig {
  label: string;
  variant: 'success' | 'secondary' | 'destructive' | 'warning';
  status: StreamState;
  icon: LucideIcon;
}

export const streamStatusConfig: Record<StreamState, StreamStatusConfig> = {
  created: { label: 'Criado', variant: 'secondary', status: 'created', icon: Video },
  starting: { label: 'Iniciando', variant: 'warning', status: 'starting', icon: Pause },
  streaming: { label: 'Transmitindo', variant: 'success', status: 'streaming', icon: Video },
  degraded: { label: 'Degradado', variant: 'warning', status: 'degraded', icon: AlertCircle },
  retrying: {
    label: 'Tentando Reconectar',
    variant: 'warning',
    status: 'retrying',
    icon: AlertCircle,
  },
  paused: { label: 'Pausado', variant: 'secondary', status: 'paused', icon: Pause },
  offline: { label: 'Offline', variant: 'destructive', status: 'offline', icon: AlertCircle },
  stopped: { label: 'Parado', variant: 'secondary', status: 'stopped', icon: VideoOff },
};
