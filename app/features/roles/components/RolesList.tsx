import { Link } from 'react-router';
import { Pencil, Shield, ShieldCheck, ShieldX, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import type { RolePermissions } from '~/types/permissions';

interface RolesListProps {
  roles: RolePermissions[];
  isLoading?: boolean;
}

export function RolesList({ roles, isLoading }: RolesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Carregando perfis...</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-center">Hierarquia</TableHead>
            <TableHead className="text-center">Permissões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhum perfil encontrado.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {role.isSystem ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                    <span>{role.name}</span>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {role.description || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{role.hierarchy}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{role.permissions?.length || 0}</Badge>
                </TableCell>
                <TableCell>
                  {role.isActive ? (
                    <Badge variant="success" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldX className="h-3 w-3" />
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(role.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Editar perfil"
                    tooltip={true}
                    tooltipText="Editar perfil"
                    asChild
                  >
                    <Link to={`/role/${role.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
