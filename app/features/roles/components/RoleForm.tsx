import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { User, Shield, Lock } from 'lucide-react';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { FormSection } from '~/components/ui/form-section';
import { FormField, Select, Textarea } from '~/components/ui';
import { roleSchema, type RoleFormData } from '~/features/roles/schemas/role.schema';
import { useCreateRole, useUpdateRole, usePermissions } from '~/features/roles/hooks/useRoles';
import { PermissionsMatrix } from './PermissionsMatrix';
import type { RolePermissions } from '~/types/permissions';

interface RoleFormProps {
  role?: RolePermissions;
}

function getPermissionKey(permission: { resource: string; action: string }): string {
  return `${permission.resource}:${permission.action}`;
}

export function RoleForm({ role }: RoleFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!role;
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: role
      ? {
          name: role.name,
          description: role.description || '',
          hierarchy: role.hierarchy,
          isActive: role.isActive,
          permissions: role.permissions?.map(getPermissionKey) || [],
        }
      : {
          name: '',
          description: '',
          hierarchy: 0,
          isActive: true,
          permissions: [],
        },
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: role.id,
          data: {
            description: data.description,
            hierarchy: data.hierarchy,
            isActive: data.isActive,
            permissions: data.permissions,
          },
        });
        toast.success('Perfil atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          hierarchy: data.hierarchy,
          isActive: data.isActive,
          permissions: data.permissions,
        });
        toast.success('Perfil criado com sucesso!');
      }
      navigate('/roles');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      toast.error(isEditMode ? 'Erro ao atualizar perfil' : 'Erro ao criar perfil', {
        description: message,
      });
      console.error(error);
    }
  };

  const isSystemRole = role?.isSystem;
  const isPending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
      {isSystemRole && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Este é um perfil do sistema. Algumas configurações não podem ser alteradas.
            </span>
          </div>
        </div>
      )}

      <FormSection title="Informações do Perfil">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <span className="text-xs font-medium">Dados básicos</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="space-y-2">
            <Label htmlFor="name" className="text-form-label">
              Nome
            </Label>
            <Input
              id="name"
              placeholder="Nome do perfil"
              {...register('name')}
              disabled={isSystemRole || isEditMode}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="hierarchy" className="text-form-label">
              Hierarquia
            </Label>
            <Input
              id="hierarchy"
              type="number"
              placeholder="0"
              {...register('hierarchy')}
              disabled={isSystemRole}
            />
            {errors.hierarchy && (
              <p className="text-sm text-destructive">{errors.hierarchy.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Quanto maior o valor, mais privilégios o perfil possui.
            </p>
          </FormField>

          <FormField className="space-y-2 sm:col-span-2">
            <Label htmlFor="description" className="text-form-label">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descrição do perfil"
              {...register('description')}
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="isActive" className="text-form-label">
              Status
            </Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select
                  id="isActive"
                  value={field.value ? 'true' : 'false'}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  disabled={isSystemRole}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </Select>
              )}
            />
            {errors.isActive && (
              <p className="text-sm text-destructive">{errors.isActive.message}</p>
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Permissões">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">Selecione as permissões para este perfil</span>
        </div>

        {isLoadingPermissions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Carregando permissões...</div>
          </div>
        ) : permissions && permissions.length > 0 ? (
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <PermissionsMatrix
                permissions={permissions}
                selectedPermissions={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma permissão disponível.
          </div>
        )}
      </FormSection>

      <FormSection className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/roles')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} loading={isPending}>
          {isEditMode ? 'Atualizar perfil' : 'Criar perfil'}
        </Button>
      </FormSection>
    </form>
  );
}
