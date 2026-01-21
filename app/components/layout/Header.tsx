import { Menu, Moon, Sun } from 'lucide-react';
import { useUIStore } from '~/store';
import { useTheme } from '~/hooks/useTheme';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-40',
        'h-16 border-b bg-background/95 backdrop-blur-sm supports-[-backdrop-filter]:bg-background/60',
        'flex items-center justify-between px-4 gap-4',
        'lg:left-64'
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
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
