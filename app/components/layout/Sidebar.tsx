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
  SquareScissors,
  Cctv,
  Clapperboard,
} from 'lucide-react';
import { useUIStore } from '~/store';
import { usePermissions } from '~/hooks/usePermissions';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { Permission } from '~/types';

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
    subItems: [
      { label: 'Listar Câmeras', path: '/cameras', icon: Camera, permission: 'camera:read' },
      {
        label: 'Adicionar Câmera',
        path: '/camera',
        icon: Camera,
        relatedPaths: ['/camera'],
        permission: 'camera:create',
      },
    ],
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
        label: 'Backup e Restauração',
        path: '/settings/backups',
        icon: Settings,
        permission: 'backup:read',
      },
      {
        label: 'Configurações avançadas',
        path: '/settings/config',
        icon: Settings,
        permission: 'configuration:read',
      },
    ],
    path: '/settings',
    icon: Settings,
    relatedPaths: ['/settings'],
    permission: 'configuration:read',
  },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { hasPermission, isAdmin } = usePermissions();

  // Filter nav items based on permissions
  const filteredNavItems = useMemo(() => {
    return (
      navItems
        .filter((item) => {
          // If no permission required, show the item
          if (!item.permission) return true;
          // Admin has access to everything
          if (isAdmin) return true;
          // Check if user has the required permission
          return hasPermission(item.permission);
        })
        .map((item) => {
          // Filter subitems based on permissions
          if (item.subItems) {
            const filteredSubItems = item.subItems.filter((subItem) => {
              if (!subItem.permission) return true;
              if (isAdmin) return true;
              return hasPermission(subItem.permission);
            });
            return { ...item, subItems: filteredSubItems };
          }
          return item;
        })
        // Remove parent items that have no visible subitems
        .filter((item) => {
          if (item.subItems && item.subItems.length === 0) return false;
          return true;
        })
    );
  }, [hasPermission, isAdmin]);

  // Toggle submenu expansion
  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  // Check if menu item is active
  const isItemActive = (item: NavItem): boolean => {
    if (!item.path) return false;

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/') ||
      item.relatedPaths?.some(
        (relatedPath) =>
          location.pathname === relatedPath || location.pathname.startsWith(relatedPath + '/')
      ) ||
      false
    );
  };

  // Check if any subitem is active
  const hasActiveSubItem = (item: NavItem): boolean => {
    return item.subItems?.some((subItem) => isItemActive(subItem)) || false;
  };

  // Auto-expand menu if a subitem is active
  useEffect(() => {
    filteredNavItems.forEach((item) => {
      if (item.subItems && hasActiveSubItem(item) && !expandedMenus.includes(item.label)) {
        setExpandedMenus((prev) => [...prev, item.label]);
      }
    });
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
          'fixed top-0 left-0 z-50 h-full w-64 border-r',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:z-30',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 bg-header-aside">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Video className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">VMS</h1>
              <p className="text-xs text-muted-foreground">Video Management</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = isItemActive(item);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.includes(item.label);
              const hasActiveChild = hasActiveSubItem(item);

              return (
                <li key={item.label}>
                  {/* Menu principal */}
                  {hasSubItems ? (
                    // Item com submenus - apenas expande/colapsa
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                        'transition-colors',
                        hasActiveChild
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    // Item sem submenus - navega normalmente
                    <NavLink
                      to={item.path!}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                        'transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  )}

                  {/* Submenus */}
                  {hasSubItems && isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1 border-l pl-4">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = isItemActive(subItem);

                        return (
                          <li key={subItem.label}>
                            <NavLink
                              to={subItem.path!}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                                'transition-colors',
                                isSubActive
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              {subItem.label}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground text-center">
            VMS v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </p>
        </div>
      </aside>
    </>
  );
}
