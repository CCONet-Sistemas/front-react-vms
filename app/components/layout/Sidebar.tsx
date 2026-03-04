import { useEffect, useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Camera,
  Video,
  Film,
  Bell,
  Settings,
  Users,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Cctv,
  Clapperboard,
  RefreshCw,
  CalendarClock,
  Database,
  HardDrive,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '~/store';
import { usePermissions } from '~/hooks/usePermissions';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '~/components/ui/popover';
import { Divider } from '~/components/ui/divider';
import { cn } from '~/lib/utils';
import { useAuth } from '~/hooks/useAuth';
import type { Permission } from '~/types';
import logoUrl from '~/assets/images/logo.svg';
import completeLogoUrl from '~/assets/images/complete-logo.svg';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  relatedPaths?: string[];
  subItems?: NavItem[];
  permission?: Permission;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Cameras',
    path: '/cameras',
    icon: Camera,
    relatedPaths: ['/camera'],
    permission: 'camera:read',
  },
  { label: 'Visualização ao Vivo', path: '/live-view', icon: Cctv, permission: 'stream:read' },
  {
    label: 'Gravações',
    subItems: [
      {
        label: 'Listar Gravações',
        path: '/recordings',
        icon: Video,
        permission: 'recording:read',
        relatedPaths: ['/recording'],
      },
      {
        label: 'Videos Salvos',
        path: '/saved-videos',
        icon: Clapperboard,
        permission: 'recording:read',
        relatedPaths: ['/saved-video'],
      },
    ],
    icon: Film,
    path: '/recordings',
    relatedPaths: ['/recording'],
    permission: 'recording:read',
  },
  {
    label: 'Eventos',
    path: '/events',
    icon: Bell,
    relatedPaths: ['/event'],
    permission: 'event:read',
  },
  {
    label: 'Usuários',
    path: '/users',
    icon: Users,
    relatedPaths: ['/user'],
    permission: 'user:read',
  },
  {
    label: 'Configurações',
    subItems: [
      {
        label: 'Configurações de perfil',
        path: '/settings/profile',
        icon: User,
        permission: 'configuration:read',
      },
      {
        label: 'Perfis de acesso',
        path: '/settings/roles',
        icon: Shield,
        relatedPaths: ['/role'],
        permission: 'role:read',
      },
      {
        label: 'Backup',
        icon: Database,
        permission: 'backup:read',
        subItems: [
          {
            label: 'Gerenciar Backups',
            path: '/settings/backups/manager',
            icon: HardDrive,
            permission: 'backup:read',
          },
          {
            label: 'Agendamentos',
            path: '/settings/backups/schedules',
            icon: CalendarClock,
            permission: 'backup:read',
          },
          {
            label: 'Configurações',
            path: '/settings/backups/config',
            icon: Settings,
            permission: 'backup:read',
          },
        ],
      },
      {
        label: 'Configurações avançadas',
        path: '/settings/config',
        icon: Settings,
        permission: 'configuration:read',
      },
      {
        label: 'Sincronização',
        path: '/settings/sync',
        icon: RefreshCw,
        permission: 'event:read',
      },
    ],
    path: '/settings',
    icon: Settings,
    relatedPaths: ['/settings'],
    permission: 'configuration:read',
  },
];

// ─── Flyout Menu (collapsed mode) ─────────────────────────────────────────────

function FlyoutItems({ items }: { items: NavItem[] }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string[]>([]);

  const isActive = (item: NavItem) => {
    if (!item.path) return false;
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/') ||
      item.relatedPaths?.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + '/')
      ) ||
      false
    );
  };

  const toggle = (label: string) =>
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  return (
    <ul className="space-y-[2px]">
      {items.map((item) => {
        const active = isActive(item);
        const hasChildren = !!item.subItems?.length;
        const isExpanded = expanded.includes(item.label);

        return (
          <li key={item.label}>
            {hasChildren ? (
              <>
                <button
                  onClick={() => toggle(item.label)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
                {isExpanded && (
                  <ul className="mt-0.5 ml-4 border-l pl-3 space-y-[2px]">
                    <FlyoutItems items={item.subItems!} />
                  </ul>
                )}
              </>
            ) : (
              <PopoverClose asChild>
                <NavLink
                  to={item.path!}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-[#7BB0FF40] text-[#17181A] font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </PopoverClose>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterNavItems(
  items: NavItem[],
  hasPermission: (p: Permission) => boolean,
  isAdmin: boolean
): NavItem[] {
  return items
    .filter((item) => !item.permission || isAdmin || hasPermission(item.permission))
    .map((item) => {
      if (item.subItems) {
        return { ...item, subItems: filterNavItems(item.subItems, hasPermission, isAdmin) };
      }
      return item;
    })
    .filter((item) => !item.subItems || item.subItems.length > 0);
}

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const { logout } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { hasPermission, isAdmin } = usePermissions();

  const filteredNavItems = useMemo(
    () => filterNavItems(navItems, hasPermission, isAdmin),
    [hasPermission, isAdmin]
  );

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (!item.path) return false;
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/') ||
      item.relatedPaths?.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + '/')
      ) ||
      false
    );
  };

  const hasActiveDescendant = (item: NavItem): boolean => {
    return item.subItems?.some((sub) => isItemActive(sub) || hasActiveDescendant(sub)) || false;
  };

  // Auto-expand menus when a descendant is active
  useEffect(() => {
    const toExpand: string[] = [];

    function collect(items: NavItem[]) {
      for (const item of items) {
        if (item.subItems) {
          if (hasActiveDescendant(item) && !expandedMenus.includes(item.label)) {
            toExpand.push(item.label);
          }
          collect(item.subItems);
        }
      }
    }

    collect(filteredNavItems);

    if (toExpand.length > 0) {
      setExpandedMenus((prev) => [...new Set([...prev, ...toExpand])]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, filteredNavItems]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, setSidebarOpen]);

  // ─── Recursive render ────────────────────────────────────────────────────────

  function renderItems(items: NavItem[], depth = 0) {
    return items.map((item) => {
      const isActive = isItemActive(item);
      const hasChildren = !!item.subItems?.length;
      const isExpanded = expandedMenus.includes(item.label);
      const hasActiveChild = hasActiveDescendant(item);

      if (depth === 0) {
        // ── Level 1 (top-level) ──────────────────────────────────────────────

        // Collapsed + has children → flyout
        if (collapsed && hasChildren) {
          return (
            <li key={item.label}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    title={item.label}
                    className={cn(
                      'w-full flex items-center justify-center rounded-lg px-3 py-2 transition-colors',
                      hasActiveChild
                        ? 'bg-[#7BB0FF40] text-[#17181A]'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="w-52 p-2"
                >
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <FlyoutItems items={item.subItems!} />
                </PopoverContent>
              </Popover>
            </li>
          );
        }

        return (
          <li key={item.label}>
            {hasChildren ? (
              <button
                onClick={() => toggleMenu(item.label)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center rounded-lg px-3 py-2 transition-colors',
                  collapsed ? 'justify-center' : 'justify-between gap-3',
                  hasActiveChild
                    ? 'bg-[#7BB0FF40] text-[#17181A]'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className={cn('flex items-center', !collapsed && 'gap-3')}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && item.label}
                </div>
                {!collapsed && (isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
              </button>
            ) : (
              <NavLink
                to={item.path!}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 transition-colors',
                  collapsed ? 'justify-center' : 'gap-3',
                  isActive
                    ? 'bg-[#7BB0FF40] text-[#17181A]'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.label}
              </NavLink>
            )}

            {!collapsed && hasChildren && isExpanded && (
              <ul className="mt-1 ml-4 space-y-1 border-l pl-4">
                {renderItems(item.subItems!, 1)}
              </ul>
            )}
          </li>
        );
      }

      if (depth === 1) {
        // ── Level 2 ──────────────────────────────────────────────────────────
        return (
          <li key={item.label}>
            {hasChildren ? (
              <button
                onClick={() => toggleMenu(item.label)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm',
                  'transition-colors',
                  hasActiveChild
                    ? 'bg-[#7BB0FF40] text-[#17181A] font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <NavLink
                to={item.path!}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                  'transition-colors',
                  isActive
                    ? 'bg-[#7BB0FF40] text-[#17181A] font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )}

            {hasChildren && isExpanded && (
              <ul className="mt-1 ml-3 space-y-1 border-l pl-3">
                {renderItems(item.subItems!, 2)}
              </ul>
            )}
          </li>
        );
      }

      // ── Level 3+ ────────────────────────────────────────────────────────────
      return (
        <li key={item.label}>
          <NavLink
            to={item.path!}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs',
              'transition-colors',
              isActive
                ? 'bg-[#7BB0FF40] text-[#17181A] font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </NavLink>
        </li>
      );
    });
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full border-r',
          'flex flex-col',
          'transition-[width,transform] duration-300 ease-in-out',
          'lg:translate-x-0 lg:z-30',
          collapsed ? 'w-[78px]' : 'w-80',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 bg-header-aside shrink-0">
          {collapsed ? (
            <div className="flex w-full items-center justify-start">
              <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="Logo" className="h-8 w-auto shrink-0" />
                <img src={completeLogoUrl} alt="Logo completo" className="h-8 w-auto" />
              </div>

              {/* Close — mobile only */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-[3px]">{renderItems(filteredNavItems, 0)}</ul>
        </nav>

        {/* Footer */}
        <div className="shrink-0">
          <Divider />
          <div className="p-3">
            <button
              onClick={logout}
              title={collapsed ? 'Sair' : undefined}
              className={cn(
                'w-full flex items-center rounded-lg px-3 py-2 transition-colors',
                'text-muted-foreground hover:bg-accent hover:text-destructive',
                collapsed ? 'justify-center' : 'gap-3'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
