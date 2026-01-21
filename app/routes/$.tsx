import type { LoaderFunctionArgs } from 'react-router';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Silently ignore Chrome DevTools and browser-specific requests
  if (
    url.pathname.startsWith('/.well-known/') ||
    url.pathname.includes('devtools') ||
    url.pathname.endsWith('.json')
  ) {
    return new Response(null, { status: 404 });
  }

  // For other 404s, you could redirect to a 404 page or home
  throw new Response('Not Found', { status: 404 });
}

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}
