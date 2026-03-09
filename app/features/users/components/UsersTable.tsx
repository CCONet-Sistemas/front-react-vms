import { useState } from 'react';
import { Pencil, Trash2, UserCheck, UserX, UserPlus } from 'lucide-react';
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
import { ConfirmDeleteDialog } from '~/components/common/ConfirmDeleteDialog';
import type { User } from '~/types';
import { Link } from 'react-router';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isDeleting?: boolean;
}

export function UsersTable({ users, onEdit, onDelete, isDeleting }: UsersTableProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/user/new">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Criar primeiro usuário
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                return (
                  <TableRow key={user.uuid}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.name?.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        )) || <span className="text-muted-foreground text-sm">Sem role</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success" className="gap-1">
                          <UserCheck className="h-3 w-3" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <UserX className="h-3 w-3" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Editar usuário"
                          tooltip={true}
                          tooltipText="Editar usuário"
                        >
                          <Link to={`/user/${user.uuid}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setUserToDelete(user)}
                          title="Excluir usuário"
                          className="text-destructive hover:text-destructive"
                          tooltip={true}
                          tooltipText="Remover usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDeleteDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        description={
          <>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>? Esta
            ação não pode ser desfeita.
          </>
        }
      />
    </>
  );
}
