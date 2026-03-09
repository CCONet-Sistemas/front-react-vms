import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Camera,
  Calendar,
  Video,
  Bookmark,
  Users,
  Monitor,
  User,
  Shield,
  RefreshCw,
  Bell,
  HardDrive,
  CalendarClock,
  Settings,
  List,
  FileText,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '~/components/ui/command';
import { useUIStore } from '~/store';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Câmeras', path: '/cameras', icon: Camera },
  { label: 'Eventos', path: '/events', icon: Calendar },
  { label: 'Gravações', path: '/recordings', icon: Video },
  { label: 'Vídeos Salvos', path: '/saved-videos', icon: Bookmark },
  { label: 'Usuários', path: '/users', icon: Users },
  { label: 'Live View', path: '/live-view', icon: Monitor },
];

const SETTINGS_ITEMS = [
  { label: 'Configurações de perfil', path: '/settings/profile', icon: User },
  { label: 'Perfis de acesso', path: '/settings/roles', icon: Shield },
  { label: 'Gerenciar Backups', path: '/settings/backups/manager', icon: HardDrive },
  { label: 'Agendamentos de Backup', path: '/settings/backups/schedules', icon: CalendarClock },
  { label: 'Configurações de Backup', path: '/settings/backups/config', icon: Settings },
  { label: 'Logs de Notificações', path: '/settings/notifications', icon: List },
  { label: 'Templates de Notificações', path: '/settings/notifications/templates', icon: FileText },
  { label: 'Configurações avançadas', path: '/settings/config', icon: Settings },
  { label: 'Sincronização', path: '/settings/sync', icon: RefreshCw },
];

const normalize = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const filterItems = (value: string, search: string) =>
  normalize(value).includes(normalize(search)) ? 1 : 0;

export function CommandPalette() {
  const open = useUIStore((state) => state.commandPaletteOpen);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette]);

  const handleSelect = (path: string) => {
    navigate(path);
    closeCommandPalette();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => (v ? openCommandPalette() : closeCommandPalette())}
      filter={filterItems}
    >
      <CommandInput placeholder="Buscar páginas... (⌘K)" />
      <CommandList className="max-h-[450px]">
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <CommandItem key={path} value={label} onSelect={() => handleSelect(path)}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Configurações">
          {SETTINGS_ITEMS.map(({ label, path, icon: Icon }) => (
            <CommandItem key={path} value={label} onSelect={() => handleSelect(path)}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
