import { Menu, Moon, Sun, Search } from 'lucide-react';
import { useUIStore } from '~/store';
import { useTheme } from '~/hooks/useTheme';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleSidebarCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40',
        'h-16 border-b bg-background/95 backdrop-blur-sm supports-[-backdrop-filter]:bg-background/60',
        'flex items-center justify-between px-4 gap-4',
        'transition-[left] duration-300 ease-in-out',
        'left-0 lg:left-[78px]',
        !sidebarCollapsed && 'lg:left-80'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile: abre/fecha o sidebar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop: recolhe/expande o sidebar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex"
          aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={openCommandPalette}
          aria-label="Busca global (Ctrl+K)"
        >
          <Search className="h-5 w-5" />
        </Button>

        <NotificationsDropdown />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
