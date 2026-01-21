# GitHub Copilot Instructions - VMS Frontend

## Project Context
This is a Video Management System (VMS) frontend application built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui. The application integrates with a NestJS backend API for managing cameras, live streams, recordings, and events.

## Technology Stack

### Core
- React 18+ with TypeScript (strict mode)
- Vite as build tool
- Tailwind CSS for styling
- shadcn/ui component library
- React Router v6 for routing

### State Management
- **TanStack Query (React Query):** For ALL server state (API data)
- **Zustand:** For client state and real-time data only
- **WebSocket:** For real-time updates (camera status, events)

### Key Libraries
- Axios for HTTP requests
- Zod for validation
- date-fns for date manipulation
- React Hook Form for forms

## Code Generation Guidelines

### When generating TypeScript code:
1. Always use explicit types for function parameters and return values
2. Prefer `interface` for object shapes, `type` for unions
3. Use optional chaining (`?.`) and nullish coalescing (`??`)
4. Enable strict null checks

### When generating React components:
1. Use functional components only (no class components)
2. Prefer named exports over default exports (except pages)
3. Extract complex logic into custom hooks
4. Keep components under 200 lines
5. Use TypeScript for prop types

### When working with API calls:
1. Always create service functions in `services/api/`
2. Use TanStack Query hooks for data fetching
3. Never use fetch directly - use the configured Axios client
4. Handle loading, error, and success states

### When creating forms:
1. Use React Hook Form with Zod validation
2. Use shadcn/ui form components
3. Show validation errors inline
4. Disable submit button during submission

### When styling components:
1. Use Tailwind utility classes
2. Group related utilities (layout, spacing, colors)
3. Use `cn()` helper for conditional classes
4. Follow mobile-first responsive design

## File Structure Patterns

### API Service Pattern
```typescript
// services/api/[resource]Service.ts
import { apiClient } from './client';
import { ResourceType, CreateResourceDto } from '@/types/resource.types';

export const resourceService = {
  list: async (params?: PaginationParams) => {
    const { data } = await apiClient.get<ResourceType[]>('/resource', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ResourceType>(`/resource/${id}`);
    return data;
  },
  create: async (payload: CreateResourceDto) => {
    const { data } = await apiClient.post<ResourceType>('/resource', payload);
    return data;
  },
  update: async (id: string, payload: Partial<CreateResourceDto>) => {
    const { data } = await apiClient.put<ResourceType>(`/resource/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/resource/${id}`);
  },
};
```

### TanStack Query Hook Pattern
```typescript
// features/[feature]/hooks/use[Resource].ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '@/services/api/resourceService';

export const useResources = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['resources', 'list', params],
    queryFn: () => resourceService.list(params),
    staleTime: 30000,
  });
};

export const useResource = (id: string) => {
  return useQuery({
    queryKey: ['resources', id],
    queryFn: () => resourceService.getById(id),
    enabled: !!id,
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resourceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
```

### Zustand Store Pattern
```typescript
// store/[domain].store.ts
import { create } from 'zustand';

interface DomainState {
  // State
  items: Item[];
  selectedId: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  setSelectedId: (id: string | null) => void;
  reset: () => void;
}

export const useDomainStore = create<DomainState>((set) => ({
  items: [],
  selectedId: null,
  
  setItems: (items) => set({ items }),
  setSelectedId: (selectedId) => set({ selectedId }),
  reset: () => set({ items: [], selectedId: null }),
}));
```

### Component Pattern
```typescript
// features/[feature]/components/ComponentName.tsx
import { FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComponentNameProps {
  data: DataType;
  onAction?: (id: string) => void;
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({ 
  data, 
  onAction,
  className 
}) => {
  const handleClick = () => {
    onAction?.(data.id);
  };

  return (
    <Card className={cn('cursor-pointer', className)}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick}>Action</Button>
      </CardContent>
    </Card>
  );
};
```

### Page Pattern (File-based Routing)
```typescript
// pages/[feature]/index.tsx
import { FC } from 'react';
import { useResources } from '@/features/resource/hooks/useResources';
import { ResourceList } from '@/features/resource/components/ResourceList';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const ResourcePage: FC = () => {
  const { data, isLoading, error } = useResources();

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Resources</h1>
      <ResourceList resources={data} />
    </div>
  );
};

export default ResourcePage;
```

## Important Rules

### State Management
- ✅ **DO:** Use TanStack Query for ALL server data
- ✅ **DO:** Use Zustand for client state and WebSocket data
- ❌ **DON'T:** Mix server data with Zustand
- ❌ **DON'T:** Use useState for data that should be in TanStack Query

### API Calls
- ✅ **DO:** Create service functions in `services/api/`
- ✅ **DO:** Use TanStack Query hooks in components
- ❌ **DON'T:** Call API directly from components
- ❌ **DON'T:** Use fetch - always use Axios client

### Components
- ✅ **DO:** Keep components focused and under 200 lines
- ✅ **DO:** Extract logic into custom hooks
- ✅ **DO:** Use shadcn/ui components from `@/components/ui/`
- ❌ **DON'T:** Modify shadcn/ui components directly
- ❌ **DON'T:** Use inline styles or CSS-in-JS

### Imports
- ✅ **DO:** Use path aliases (`@/`, `@components/`, etc)
- ✅ **DO:** Group imports (React, libraries, local, styles)
- ❌ **DON'T:** Use relative imports across features

### Styling
- ✅ **DO:** Use Tailwind utility classes
- ✅ **DO:** Use `cn()` helper for conditional classes
- ✅ **DO:** Follow mobile-first responsive design
- ❌ **DON'T:** Use inline styles
- ❌ **DON'T:** Create CSS files (except globals.css)

## Path Aliases
Always use these path aliases in imports:
- `@/` - src root
- `@components/` - src/components
- `@features/` - src/features
- `@services/` - src/services
- `@hooks/` - src/hooks
- `@store/` - src/store
- `@utils/` - src/utils
- `@types/` - src/types
- `@lib/` - src/lib

## API Endpoints Reference

### Authentication
- POST `/authentication` - Login
- POST `/authentication/refresh` - Refresh token
- POST `/authentication/logout` - Logout

### Cameras
- GET `/camera` - List cameras (pagination)
- GET `/camera/{id}` - Get camera details
- POST `/camera` - Create camera
- PUT `/camera/{id}` - Update camera
- DELETE `/camera/{id}` - Delete camera
- POST `/camera/{id}/start` - Start recording
- POST `/camera/{id}/stop` - Stop recording
- GET `/camera/{id}/status` - Get status

### Live Streaming
- GET `/stream/{cameraId}/jpeg` - JPEG snapshot
- GET `/stream/{cameraId}/mjpeg` - MJPEG stream
- GET `/stream/{cameraId}/hls` - HLS playlist

### Events
- GET `/events` - List events (filters, pagination)
- GET `/events/{id}` - Get event details
- PATCH `/events/{id}/acknowledge` - Acknowledge event
- PATCH `/events/{id}/resolve` - Resolve event
- PATCH `/events/{id}/archive` - Archive event

### Users
- GET `/users` - List users
- POST `/users` - Create user
- PUT `/users/{uuid}` - Update user
- DELETE `/users/{uuid}` - Delete user

## Common Patterns

### Loading State
```typescript
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
});

const onSubmit = form.handleSubmit(async (data) => {
  await mutation.mutateAsync(data);
});
```

### Pagination
```typescript
const [page, setPage] = useState(1);
const [limit] = useState(10);

const { data } = useResources({ page, limit });

<Pagination
  currentPage={page}
  totalPages={data?.totalPages ?? 1}
  onPageChange={setPage}
/>
```

### Real-time Updates (WebSocket)
```typescript
// In App.tsx or MainLayout
useEffect(() => {
  wsManager.connect(import.meta.env.VITE_WS_URL);
  
  const unsubscribe = wsManager.subscribe('event_type', (data) => {
    // Update Zustand store
    useEventStore.getState().addEvent(data);
  });
  
  return () => unsubscribe();
}, []);
```

## Feature-based Structure
Each feature should be self-contained in `features/[feature-name]/`:
```
features/cameras/
├── components/       # Camera-specific components
│   ├── CameraCard/
│   ├── CameraForm/
│   └── CameraGrid/
├── hooks/           # Camera-specific hooks
│   ├── useCameras.ts
│   └── useCameraStream.ts
├── services/        # Camera-specific services (if needed)
├── types/           # Camera-specific types
└── utils/           # Camera-specific utilities
```

## Environment Variables
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=VMS
VITE_APP_VERSION=1.0.0
```

Access via: `import.meta.env.VITE_API_URL`

## shadcn/ui Components Available
Import from `@/components/ui/`:
- button, input, card, badge, alert, toast
- dialog, alert-dialog, dropdown-menu, select
- table, tabs, skeleton, form
- calendar, date-picker, command

Generate new components:
```bash
npx shadcn-ui@latest add [component-name]
```

## Best Practices Summary

1. **Always use TypeScript** with strict mode
2. **Use TanStack Query** for all server data
3. **Use Zustand** only for client/real-time state
4. **Follow feature-based structure** for organization
5. **Use shadcn/ui components** - don't modify them directly
6. **Use Tailwind CSS** for all styling
7. **Extract logic** into custom hooks
8. **Keep components small** and focused
9. **Handle loading/error states** properly
10. **Use path aliases** for cleaner imports

## Testing (When Implemented)
- Write tests in `.test.tsx` files next to components
- Use Vitest + Testing Library
- Mock API calls with MSW
- Test user interactions, not implementation details

## Performance Tips
- Use `React.lazy()` for route-based code splitting
- Use `React.memo()` for expensive components
- Use `useMemo()` and `useCallback()` appropriately
- Virtualize long lists with react-window
- Monitor bundle size with `vite build --analyze`

---

**Remember:** This is a professional production application. Write clean, maintainable, type-safe code that follows these patterns consistently.