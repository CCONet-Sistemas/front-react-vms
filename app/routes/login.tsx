import type { Route } from './+types/login';
import { redirect } from 'react-router';
import { LoginForm } from '~/features/auth/components/LoginForm';
import { useAuthStore } from '~/store';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Login | VMS' },
    { name: 'description', content: 'Login to VMS - Video Management System' },
  ];
}

export function clientLoader() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (isAuthenticated) {
    return redirect('/dashboard');
  }
  return null;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
