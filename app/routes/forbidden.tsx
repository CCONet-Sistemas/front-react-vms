import { Link } from 'react-router';
import { ShieldX } from 'lucide-react';
import { Button } from '~/components/ui/button';

export function meta() {
  return [
    { title: 'Acesso Negado | VMS' },
    { name: 'description', content: 'Você não tem permissão para acessar esta página' },
  ];
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <ShieldX className="h-24 w-24 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">403</h1>
          <h2 className="text-xl font-semibold">Acesso Negado</h2>
          <p className="text-muted-foreground max-w-md">
            Você não tem permissão para acessar esta página.
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
