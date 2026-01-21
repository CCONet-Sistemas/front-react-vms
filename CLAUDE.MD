# VMS Frontend Project - Claude Code Instructions

## Project Overview
Video Management System (VMS) frontend built with React Router v7 (framework mode) + Vite + TypeScript, integrating with NestJS backend API.

## Tech Stack
- **Framework:** React Router v7 (framework mode with SSR support)
- **React:** 19
- **Build Tool:** Vite 7
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **State Management:**
  - TanStack Query (React Query) for server state
  - Zustand for client state and real-time data
- **HTTP Client:** Axios
- **Real-time:** WebSocket for live events and camera status
- **Form Validation:** Zod + React Hook Form
- **Date Handling:** date-fns

## Project Structure

```
app/
├── components/
│   ├── ui/             # shadcn/ui primitives (generated via CLI)
│   ├── common/         # Reusable custom components
│   └── layout/         # Layout components (Header, Sidebar, etc)
├── features/           # Feature-based modules (self-contained)
│   ├── auth/
│   ├── cameras/
│   ├── live-view/
│   ├── recordings/
│   ├── events/
│   └── settings/
├── hooks/              # Global custom hooks
├── lib/                # Third-party utilities (shadcn utils)
├── routes/             # Route files (file-based routing)
├── services/
│   ├── api/           # API client and interceptors
│   └── websocket/     # WebSocket manager
├── store/              # Zustand stores
├── styles/             # Global styles
├── types/              # TypeScript types and interfaces
├── utils/              # Helper functions
├── root.tsx            # Root layout component
└── routes.ts           # Route configuration
public/                 # Static assets
```

## Scripts

```bash
# Development
npm run dev           # Start dev server with HMR

# Build
npm run build         # Build for production

# Production
npm run start         # Serve production build

# Type checking
npm run typecheck     # Run TypeScript type checking
```

## Naming Conventions

### Files and Components
- **Components:** PascalCase (e.g., `CameraCard.tsx`, `VideoPlayer.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`, `useCameras.ts`)
- **Services:** camelCase with `Service` suffix (e.g., `cameraService.ts`, `authService.ts`)
- **Stores:** camelCase with `.store` suffix (e.g., `auth.store.ts`, `cameras.store.ts`)
- **Types:** camelCase with `.types` suffix (e.g., `camera.types.ts`, `api.types.ts`)
- **Routes:** lowercase with hyphens (e.g., `cameras.tsx`, `camera.$id.tsx`)

### shadcn/ui Components
- Located in `app/components/ui/`
- Generated via CLI: `npx shadcn@latest add [component]`
- DO NOT modify directly - customize via Tailwind classes or create wrappers
- Use lowercase with hyphens (e.g., `button.tsx`, `dialog.tsx`)

## Code Style Guidelines

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use type for unions and primitives
- Always type function parameters and return types
- Use optional chaining and nullish coalescing

### React
- Use functional components only
- Prefer named exports over default exports (except for route components)
- Use custom hooks to extract complex logic
- Keep components under 200 lines (split if larger)
- Use React.memo() for expensive components

### State Management Rules
- **TanStack Query:** For ALL server data (GET, POST, PUT, DELETE)
  - Query keys: `['resource', 'action', params]` (e.g., `['cameras', 'list']`)
  - Mutations: Always invalidate related queries after success
- **Zustand:** For client state and real-time data only
  - Auth state (user, token, isAuthenticated)
  - Real-time camera status
  - Real-time events
  - UI state (sidebar open/closed, theme, preferences)
- **Never mix:** Don't store server data in Zustand

## Path Alias

The project uses `~/` as the path alias pointing to `./app/`:

```typescript
// Import examples
import { Button } from '~/components/ui/button';
import { useAuth } from '~/hooks/useAuth';
import { cameraService } from '~/services/api/cameraService';
import type { Camera } from '~/types/camera.types';
```

## React Router v7 Patterns

### Route Definition (app/routes.ts)
```typescript
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("cameras", "routes/dashboard/cameras.tsx"),
    route("cameras/:id", "routes/dashboard/camera-detail.tsx"),
  ]),
] satisfies RouteConfig;
```

### Route Component with Loader
```typescript
// app/routes/dashboard/cameras.tsx
import type { Route } from "./+types/cameras";
import { cameraService } from "~/services/api/cameraService";

export async function loader({ request }: Route.LoaderArgs) {
  const cameras = await cameraService.list();
  return { cameras };
}

export default function CamerasPage({ loaderData }: Route.ComponentProps) {
  const { cameras } = loaderData;
  return <CameraGrid cameras={cameras} />;
}
```

### Route Component with Action
```typescript
// app/routes/dashboard/camera-create.tsx
import type { Route } from "./+types/camera-create";
import { redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  await cameraService.create(data);
  return redirect("/cameras");
}

export default function CreateCameraPage() {
  return <CameraForm />;
}
```

## API Services Pattern

```typescript
// app/services/api/cameraService.ts
import { apiClient } from './client';
import type { Camera, CreateCameraDto } from '~/types/camera.types';

export const cameraService = {
  list: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<Camera[]>('/camera', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Camera>(`/camera/${id}`);
    return data;
  },

  create: async (payload: CreateCameraDto) => {
    const { data } = await apiClient.post<Camera>('/camera', payload);
    return data;
  },
};
```

## TanStack Query Hook Pattern

```typescript
// app/features/cameras/hooks/useCameras.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cameraService } from '~/services/api/cameraService';

export const useCameras = () => {
  return useQuery({
    queryKey: ['cameras', 'list'],
    queryFn: () => cameraService.list(),
    staleTime: 30000,
  });
};

export const useCreateCamera = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cameraService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] });
    },
  });
};
```

## Zustand Store Pattern

```typescript
// app/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '~/types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

## Component Structure Pattern

```typescript
// app/features/cameras/components/CameraCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import type { Camera } from '~/types/camera.types';

interface CameraCardProps {
  camera: Camera;
  onClick?: (id: string) => void;
}

export function CameraCard({ camera, onClick }: CameraCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{camera.name}</CardTitle>
        <Badge variant={camera.status === 'recording' ? 'default' : 'secondary'}>
          {camera.status}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

## API Integration

### Base URL and Environment Variables
```typescript
// .env.development
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

// app/services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Main API Endpoints
- **Auth:** `/authentication` (login), `/authentication/refresh`, `/authentication/logout`
- **Users:** `/users` (CRUD)
- **Cameras:** `/camera` (CRUD), `/camera/{id}/start`, `/camera/{id}/stop`, `/camera/{id}/status`
- **Live Stream:** `/stream/{cameraId}/jpeg`, `/stream/{cameraId}/mjpeg`, `/stream/{cameraId}/hls`
- **Recordings:** `/recording/{cameraId}/sessions`, `/recording/{cameraId}/extract`
- **Events:** `/events` (list, filters), `/events/{id}/acknowledge`, `/events/{id}/resolve`
- **System:** `/system/health`, `/system/metrics/summary`

## WebSocket Integration

### WebSocket Manager Pattern
```typescript
// app/services/websocket/WebSocketManager.ts
class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.notifyListeners(message.type, message.data);
    };
  }

  subscribe(eventType: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => this.listeners.get(eventType)?.delete(callback);
  }

  private notifyListeners(eventType: string, data: unknown) {
    this.listeners.get(eventType)?.forEach(cb => cb(data));
  }
}

export const wsManager = new WebSocketManager();
```

## Tailwind CSS v4

Tailwind v4 uses a new configuration approach via CSS:

```css
/* app/styles/app.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
}
```

### shadcn/ui Usage
```typescript
import { cn } from '~/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

## Error Handling

### API Interceptors
```typescript
// app/services/api/interceptors.ts
import { useAuthStore } from '~/store/auth.store';

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

## Performance Best Practices

1. **Code Splitting:** Use route-based code splitting (automatic with React Router v7)
2. **Memoization:** Use `React.memo()`, `useMemo()`, `useCallback()` appropriately
3. **Virtual Lists:** Use virtualization for long lists (react-window)
4. **Image Optimization:** Lazy load images, use appropriate formats
5. **Bundle Size:** Monitor with `vite build --analyze`

## Testing (Future)

- **Unit Tests:** Vitest + Testing Library
- **E2E Tests:** Playwright
- **API Mocking:** MSW (Mock Service Worker)

## Important Notes

- Always use TypeScript strict mode
- Never commit `.env` files (use `.env.example`)
- Follow the feature-based structure for new modules
- Prefer composition over prop drilling
- Keep components focused and single-responsibility
- Use semantic HTML and ARIA labels for accessibility
- Route components should use default exports
- Non-route components should use named exports

## Common Patterns

### Loading States
```typescript
const { data, isLoading, error } = useCameras();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
return <CameraList cameras={data} />;
```

### Form Handling
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## Feature Module Structure

Each feature module should be self-contained:
```
app/features/cameras/
├── components/
│   ├── CameraCard.tsx
│   ├── CameraForm.tsx
│   └── CameraGrid.tsx
├── hooks/
│   ├── useCameras.ts
│   └── useCameraStream.ts
├── types/
│   └── camera.types.ts
└── utils/
    └── cameraHelpers.ts
```

## Docker

O projeto usa Docker com SSR (Node.js) para deploy em VPS/Cloud.

### Arquivos
- `Dockerfile` - Build multi-stage para produção (Node 22 Alpine)
- `Dockerfile.dev` - Desenvolvimento com hot reload
- `docker-compose.yml` - Orquestração para produção
- `docker-compose.dev.yml` - Orquestração para desenvolvimento
- `.dockerignore` - Arquivos ignorados no build

### Comandos

```bash
# Desenvolvimento (com hot reload)
docker compose -f docker-compose.dev.yml up --build

# Produção (build e run)
docker compose up --build -d

# Apenas build da imagem
docker build -t vms-frontend .

# Ver logs
docker compose logs -f frontend

# Parar containers
docker compose down
```

### Variáveis de ambiente
Configurar via `.env` ou no `docker-compose.yml`:
- `VITE_API_URL` - URL da API backend
- `VITE_WS_URL` - URL do WebSocket

### Portas
- **Produção:** 3000 (SSR server)
- **Desenvolvimento:** 5173 (Vite dev server)

## Priority Development Order

1. **Sprint 0:** Setup inicial (shadcn/ui, API client, stores)
2. **Sprint 1:** Auth, Camera CRUD, Live View, Dashboard, WebSocket
3. **Sprint 2:** Recordings, Events, Detections, Triggers
4. **Sprint 3:** Backups, Notifications, Settings, PWA, Tests

## References
- React Router v7 Docs: https://reactrouter.com
- shadcn/ui: https://ui.shadcn.com
- TanStack Query: https://tanstack.com/query
- Zustand: https://zustand.docs.pmnd.rs
