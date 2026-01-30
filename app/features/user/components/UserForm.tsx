import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { FormSection } from '~/components/ui/form-section';
import { User, Shield } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  createUserSchema,
  updateUserSchema,
  type UserFormData,
  type UpdateUserFormData,
} from '~/features/user/schemas/user.schema';
import { useCreateUser, useUpdateUser } from '~/features/users';
import { useUserRolesPermissions } from '~/features/user/hooks/usePermissions';
import { useGroups } from '~/features/groups';
import { FormField, Select, Combobox } from '~/components/ui';
import type { User as UserType } from '~/types';

export default function UserForm({ user }: { user?: UserType }) {
  const navigate = useNavigate();
  const isEditMode = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: roles, isLoading: isLoadingRoles } = useUserRolesPermissions();
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          password: '',
          repeat_password: '',
          roleId: user.roles?.name?.[0] || '',
          groupId: user.groupId,
          isActive: user.isActive ?? true,
        }
      : {
          name: '',
          email: '',
          password: '',
          repeat_password: '',
          roleId: '',
          groupId: undefined,
          isActive: true,
        },
  });

  const onSubmit = async (data: UserFormData | UpdateUserFormData) => {
    try {
      if (isEditMode) {
        // Remove senha vazia para não enviar ao backend
        const updateData = {
          name: data.name,
          email: data.email,
          roleIds: data.roleId ? [data.roleId] : undefined,
          groupId: data.groupId,
          isActive: data.isActive,
          ...(data.password && data.password.length > 0 ? { password: data.password } : {}),
        };

        await updateMutation.mutateAsync({
          uuid: user.uuid,
          data: updateData,
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password!,
          roleIds: data.roleId ? [data.roleId] : undefined,
          groupId: data.groupId,
          isActive: data.isActive,
        });
        toast.success('Usuário criado com sucesso!');
      }
      navigate('/users');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      toast.error(isEditMode ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário', {
        description: message,
      });
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
      {/* ===================== */}
      {/* DEVICE INFO */}
      {/* ===================== */}
      <FormSection title="Usuário">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <span className="text-xs font-medium">Dados do usuário</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="space-y-2">
            <Label htmlFor="name" className="text-form-label">
              Nome
            </Label>
            <Input id="name" placeholder="Nome completo" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="email" className="text-form-label">
              Email
            </Label>
            <Input id="email" placeholder="email@exemplo.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="type" className="text-form-label">
              Senha
            </Label>
            <Input
              id="password"
              placeholder="Mínimo 6 caracteres"
              {...register('password')}
              type="password"
              autoComplete="off"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="repeat_password" className="text-form-label">
              Repetir senha
            </Label>
            <Input
              id="repeat_password"
              placeholder="Confirme a senha"
              {...register('repeat_password')}
              type="password"
            />

            {errors.repeat_password && (
              <p className="text-sm text-destructive">{errors.repeat_password.message}</p>
            )}
          </FormField>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* CONFIGURAÇÕES DE PERFIL */}
      {/* ===================== */}
      <FormSection title="Configurações de perfil">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">Perfil e permissões</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="space-y-2">
            <Label htmlFor="roleId" className="text-form-label">
              Perfil de acesso
            </Label>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Select
                  id="roleId"
                  disabled={isLoadingRoles}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="">Selecione um perfil</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.description || role.name}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.roleId && (
              <p className="text-sm text-destructive">{errors.roleId.message}</p>
            )}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="groupId" className="text-form-label">
              Grupo/Entidade
            </Label>
            <Controller
              name="groupId"
              control={control}
              render={({ field }) => (
                <Combobox
                  options={
                    groupsData?.data?.map((group) => ({
                      value: String(group.id),
                      label: group.name,
                    })) || []
                  }
                  value={field.value ? String(field.value) : ''}
                  onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  placeholder="Selecione um grupo"
                  searchPlaceholder="Buscar grupo..."
                  emptyMessage="Nenhum grupo encontrado."
                  disabled={isLoadingGroups}
                />
              )}
            />
            {errors.groupId && (
              <p className="text-sm text-destructive">{errors.groupId.message}</p>
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

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}
      <FormSection className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/users')}
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {isEditMode ? 'Atualizar usuário' : 'Criar usuário'}
        </Button>
      </FormSection>
    </form>
  );
}
