import type { Route } from './+types/_app.settings';
import { useTheme } from '~/hooks/useTheme';
import { useAuthStore, useNotificationPreferencesStore } from '~/store';
import type { SoundSeverity, EventDetectionType } from '~/store';
import { notificationSound } from '~/services/sound';
import { Moon, Sun, Monitor } from 'lucide-react';
import type { NotificationType } from '~/types/notification.types';
import { PageContent, PageHeader } from '~/components/common';
import { ProfileForm } from '~/features/profile/components/ProfileForm';
import type { Theme, ThemeOption } from '~/types/theme.types';
import type { EventNotifyTiming } from '~/store/notification-preferences.store';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Configurações | VMS' },
    {
      name: 'description',
      content: 'Configurações do sistema - Sistema de Gerenciamento de Vídeo',
    },
  ];
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Informativo',
  success: 'Sucesso',
  warning: 'Aviso',
  error: 'Erro',
  event: 'Evento (Câmera)',
};

const DETECTION_TYPE_LABELS: Record<EventDetectionType, string> = {
  motion: 'Detecção de Movimento',
  tampering: 'Violação de Câmera',
  line_crossing: 'Cruzamento de Linha',
  intrusion: 'Intrusão',
  face_recognition: 'Reconhecimento Facial',
};

const EVENT_NOTIFY_TIMING_OPTIONS: { value: EventNotifyTiming; label: string; tooltip: string }[] =
  [
    {
      value: 'both',
      label: 'Ambos',
      tooltip: 'Notificar quando o evento ocorrer e quando o vídeo estiver pronto',
    },
    {
      value: 'video_ready',
      label: 'Evento concluído',
      tooltip: 'Notificar quando o vídeo do evento estiver pronto',
    },
    {
      value: 'detection',
      label: 'Notificar quando o evento ocorrer',
      tooltip: 'Notificar quando o evento ocorrer',
    },
    {
      value: 'never',
      label: 'Nunca',
      tooltip: 'Nunca notificar sobre eventos da câmera',
    },
  ];

const SEVERITY_OPTIONS: { value: SoundSeverity; label: string }[] = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
  { value: 'critical', label: 'Crítico' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);

  // Notification preferences
  const toastsEnabled = useNotificationPreferencesStore((state) => state.toastsEnabled);
  const soundEnabled = useNotificationPreferencesStore((state) => state.soundEnabled);
  const soundVolume = useNotificationPreferencesStore((state) => state.soundVolume);
  const typeSettings = useNotificationPreferencesStore((state) => state.typeSettings);
  const detectionSettings = useNotificationPreferencesStore((state) => state.detectionSettings);
  const setToastsEnabled = useNotificationPreferencesStore((state) => state.setToastsEnabled);
  const setSoundEnabled = useNotificationPreferencesStore((state) => state.setSoundEnabled);
  const setSoundVolume = useNotificationPreferencesStore((state) => state.setSoundVolume);
  const setTypeSettings = useNotificationPreferencesStore((state) => state.setTypeSettings);
  const setDetectionSettings = useNotificationPreferencesStore(
    (state) => state.setDetectionSettings
  );
  const eventNotifyTiming = useNotificationPreferencesStore((state) => state.eventNotifyTiming);
  const setNotificationTiming = useNotificationPreferencesStore(
    (state) => state.setEventNotifyTiming
  );
  const handleTestSound = () => {
    notificationSound.testSound(soundVolume);
  };

  const handlePreviewSeverity = (severity: SoundSeverity) => {
    notificationSound.previewSeverity(severity, soundVolume);
  };

  const themeOptions: ThemeOption[] = [
    { value: 'light' as Theme, label: 'Claro', icon: Sun },
    { value: 'dark' as Theme, label: 'Escuro', icon: Moon },
    { value: 'system' as Theme, label: 'Sistema', icon: Monitor },
  ];

  return (
    <PageContent variant="form">
      <PageHeader
        title="Configurações"
        description="Gerencie sua conta e preferências do aplicativo"
      />
      <ProfileForm
        setTheme={setTheme}
        theme={theme}
        themeOptions={themeOptions}
        user={user}
        toastEnabled={toastsEnabled}
        soundEnabled={soundEnabled}
        soundVolume={soundVolume}
        typeSettings={typeSettings}
        detectionSettings={detectionSettings}
        setToastsEnabled={setToastsEnabled}
        setSoundEnabled={setSoundEnabled}
        setSoundVolume={setSoundVolume}
        setTypeSettings={setTypeSettings}
        setDetectionSettings={setDetectionSettings}
        handleTestSound={handleTestSound}
        handlePreviewSeverity={handlePreviewSeverity}
        notificationLabels={NOTIFICATION_TYPE_LABELS}
        detectionLabels={DETECTION_TYPE_LABELS}
        severityOptions={SEVERITY_OPTIONS}
        eventNotifyTiming={eventNotifyTiming}
        eventNotifyTimingOptions={EVENT_NOTIFY_TIMING_OPTIONS}
        setNotificationTiming={setNotificationTiming}
      />
    </PageContent>
  );
}
