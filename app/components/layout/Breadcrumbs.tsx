import { Link, useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '~/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Labels for route segments
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  cameras: 'Câmeras',
  camera: 'Câmera',
  'live-view': 'Visualização ao Vivo',
  recordings: 'Gravações',
  events: 'Eventos',
  event: 'Eventos',
  settings: 'Configurações',
  users: 'Usuários',
  user: 'Usuário',
  'saved-videos': 'Vídeos Salvos',
};

// Labels for dynamic segments based on context
const dynamicLabels: Record<string, Record<string, string>> = {
  camera: {
    new: 'Nova Câmera',
    default: 'Editar Câmera',
  },
  user: {
    new: 'Novo Usuário',
    default: 'Editar Usuário',
  },
  event: {
    default: 'Detalhes do Evento',
  },
};

// Check if a string is a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Get label for a segment based on context
const getSegmentLabel = (segment: string, index: number, segments: string[]): string => {
  // Check if it's a known route
  if (routeLabels[segment]) {
    return routeLabels[segment];
  }

  // Get the parent segment for context
  const parentSegment = index > 0 ? segments[index - 1] : null;

  // Check if it's a dynamic segment (UUID or special keyword)
  if (parentSegment && dynamicLabels[parentSegment]) {
    if (segment === 'new' || segment === 'novo') {
      return dynamicLabels[parentSegment].new;
    }
    if (isUUID(segment)) {
      return dynamicLabels[parentSegment].default;
    }
  }

  // Fallback: capitalize the segment
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = getSegmentLabel(segment, index, pathSegments);
    return { label, path };
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        to="/dashboard"
        className={cn(
          'flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors',
          breadcrumbs.length === 1 &&
            breadcrumbs[0].path === '/dashboard' &&
            'text-foreground font-medium'
        )}
      >
        <Home className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isDashboard = crumb.path === '/dashboard';

        if (isDashboard) return null;

        return (
          <div key={crumb.path} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
