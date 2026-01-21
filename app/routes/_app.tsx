import { redirect } from 'react-router';
import { MainLayout } from '~/components/layout';
import { useAuthStore } from '~/store';

export function clientLoader() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) {
    return redirect('/login');
  }
  return null;
}

export default function AppLayout() {
  return <MainLayout />;
}
