import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '~/store';
import { cn } from '~/lib/utils';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5',
          'hover:bg-accent transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-medium text-primary-foreground">
            {user?.name ? getInitials(user.name) : 'U'}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-56 rounded-md border bg-card p-1 shadow-lg user-menu',
            'animate-in fade-in-0 zoom-in-95'
          )}
          role="menu"
        >
          <div className="px-2 py-1.5 border-b mb-1">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
          </div>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
              'hover:bg-accent transition-colors cursor-pointer'
            )}
            role="menuitem"
          >
            <User className="h-4 w-4" />
            My Profile
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
              'hover:bg-accent transition-colors cursor-pointer'
            )}
            role="menuitem"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <div className="border-t mt-1 pt-1">
            <button
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                'hover:bg-accent transition-colors text-destructive'
              )}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
