import { Bell, Camera, Play, Shield, Sun, User, Volume2, VolumeX } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Slider } from '~/components/ui/slider';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import type { NotificationType, User as UserType } from '~/types';
import type { Theme, ThemeOption } from '~/types/theme.types';
import type { EventDetectionType, DetectionTypeSettings, SoundSeverity } from '~/store';
import type {
  EventNotifyTiming,
  NotificationTypeSettings,
} from '~/store/notification-preferences.store';

interface ProfileFormProps {
  user: UserType | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeOptions: ThemeOption[];
  toastEnabled: boolean;
  setToastsEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  typeSettings: Record<string, any>;
  setTypeSettings: (type: NotificationType, settings: Partial<NotificationTypeSettings>) => void;
  detectionSettings: Record<EventDetectionType, DetectionTypeSettings>;
  setDetectionSettings: (
    detection: EventDetectionType,
    settings: Partial<DetectionTypeSettings>
  ) => void;
  handleTestSound: () => void;
  handlePreviewSeverity: (severity: SoundSeverity) => void;
  notificationLabels: Record<NotificationType, string>;
  detectionLabels: Record<EventDetectionType, string>;
  severityOptions: { value: SoundSeverity; label: string }[];
  eventNotifyTiming: EventNotifyTiming;
  eventNotifyTimingOptions: { value: EventNotifyTiming; label: string; tooltip: string }[];
  setNotificationTiming: (timing: EventNotifyTiming) => void;
}

export const ProfileForm = ({
  user,
  theme,
  setTheme,
  themeOptions,
  toastEnabled,
  setToastsEnabled,
  soundEnabled,
  setSoundEnabled,
  soundVolume,
  setSoundVolume,
  typeSettings,
  setTypeSettings,
  detectionSettings,
  setDetectionSettings,
  handleTestSound,
  handlePreviewSeverity,
  notificationLabels,
  detectionLabels,
  severityOptions,
  eventNotifyTiming,
  eventNotifyTimingOptions,
  setNotificationTiming,
}: ProfileFormProps) => {
  // Filter out 'event' from typeSettings since we have granular detection settings
  const filteredTypeSettings = Object.fromEntries(
    Object.entries(typeSettings).filter(([key]) => key !== 'event')
  ) as Record<Exclude<NotificationType, 'event'>, any>;
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>Gerencie as informações do seu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Função</label>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {user?.roles.name || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>Personalize a aparência do aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium">Tema</label>
              <div className="flex gap-2 mt-2">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(option.value)}
                    className={cn('gap-2')}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>Gerencie suas preferências de segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Alterar Senha</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configure suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Global Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Configurações Globais</h4>

              {/* Toasts Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Notificações Visuais (Toasts)</label>
                  <p className="text-xs text-muted-foreground">
                    Exibir notificações pop-up no canto da tela
                  </p>
                </div>
                <Switch checked={toastEnabled} onCheckedChange={setToastsEnabled} />
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Sons de Notificação</label>
                  <p className="text-xs text-muted-foreground">Tocar som ao receber notificações</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

              {/* Volume Slider */}
              {soundEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <span className="text-sm text-muted-foreground">{soundVolume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={soundVolume}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={setSoundVolume}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Button variant="outline" size="sm" onClick={handleTestSound} className="ml-2">
                      <Play className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Per-Type Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Notificações do Sistema</h4>
              <div className="space-y-4">
                {(Object.keys(filteredTypeSettings) as Exclude<NotificationType, 'event'>[]).map(
                  (type) => {
                    const settings = filteredTypeSettings[type];
                    return (
                      <div key={type} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{notificationLabels[type]}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Toast Toggle */}
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-muted-foreground">Toast</label>
                            <Switch
                              checked={settings.toastEnabled}
                              onCheckedChange={(checked) =>
                                setTypeSettings(type, { toastEnabled: checked })
                              }
                              disabled={!toastEnabled}
                            />
                          </div>

                          {/* Sound Toggle */}
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-muted-foreground">Som</label>
                            <Switch
                              checked={settings.soundEnabled}
                              onCheckedChange={(checked) =>
                                setTypeSettings(type, { soundEnabled: checked })
                              }
                              disabled={!soundEnabled}
                            />
                          </div>
                        </div>

                        {/* Sound Severity */}
                        {soundEnabled && settings.soundEnabled && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="text-xs text-muted-foreground">
                              Intensidade do som:
                            </label>
                            <div className="flex gap-1">
                              {severityOptions.map((option) => (
                                <Button
                                  key={option.value}
                                  variant={
                                    settings.soundSeverity === option.value ? 'default' : 'outline'
                                  }
                                  size="sm"
                                  className="text-xs h-7 px-2"
                                  onClick={() => {
                                    setTypeSettings(type, { soundSeverity: option.value });
                                    handlePreviewSeverity(option.value);
                                  }}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Events Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <CardTitle>Eventos de Câmera</CardTitle>
            </div>
            <CardDescription>Configure notificações por tipo de detecção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 justify-between rounded-lg border p-4">
              <div className="flex items-center ">
                <label className="text-sm font-medium">Quando Notificar</label>
              </div>
              <div>
                {eventNotifyTimingOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={eventNotifyTiming === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotificationTiming(option.value)}
                    className={cn('gap-2 ml-2')}
                    tooltip={true}
                    tooltipText={option.tooltip}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Tipos de Detecção</h4>
              <div className="mb-2 text-xs text-muted-foreground">
                Configure as notificações para cada tipo de detecção de evento da câmera.
              </div>
            </div>
            {(Object.keys(detectionSettings) as EventDetectionType[]).map((detection) => {
              const settings = detectionSettings[detection];
              return (
                <div key={detection} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{detectionLabels[detection]}</span>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={(checked) =>
                        setDetectionSettings(detection, { enabled: checked })
                      }
                    />
                  </div>

                  {settings.enabled && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Toast Toggle */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground">Toast</label>
                          <Switch
                            checked={settings.toastEnabled}
                            onCheckedChange={(checked) =>
                              setDetectionSettings(detection, { toastEnabled: checked })
                            }
                            disabled={!toastEnabled}
                          />
                        </div>

                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground">Som</label>
                          <Switch
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) =>
                              setDetectionSettings(detection, { soundEnabled: checked })
                            }
                            disabled={!soundEnabled}
                          />
                        </div>
                      </div>

                      {/* Sound Severity */}
                      {soundEnabled && settings.soundEnabled && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="text-xs text-muted-foreground">
                            Intensidade do som:
                          </label>
                          <div className="flex gap-1">
                            {severityOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant={
                                  settings.soundSeverity === option.value ? 'default' : 'outline'
                                }
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() => {
                                  setDetectionSettings(detection, { soundSeverity: option.value });
                                  handlePreviewSeverity(option.value);
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
