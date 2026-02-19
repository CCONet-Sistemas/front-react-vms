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
      <FormSection title="Usuário">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <User className="h-4 w-4" />
          <span className="text-xs font-medium">Dados do usuário</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField>
            <Input
              label="Nome"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
          </FormField>

          <FormField>
            <Input
              label="Email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
          </FormField>

          <FormField>
            <Input
              label="Senha"
              type="password"
              autoComplete="off"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
            />
          </FormField>

          <FormField>
            <Input
              label="Repetir senha"
              type="password"
              error={!!errors.repeat_password}
              helperText={errors.repeat_password?.message}
              {...register('repeat_password')}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Configurações de perfil">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">Perfil e permissões</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Perfil de acesso"
                  disabled={isLoadingRoles}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={!!errors.roleId}
                  helperText={errors.roleId?.message}
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
          </FormField>

          <FormField>
            <Controller
              name="groupId"
              control={control}
              render={({ field }) => (
                <Combobox
                  label="Grupo/Entidade"
                  options={
                    groupsData?.data?.map((group) => ({
                      value: String(group.id),
                      label: group.name,
                    })) || []
                  }
                  value={field.value ? String(field.value) : ''}
                  onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  searchPlaceholder="Buscar grupo..."
                  emptyMessage="Nenhum grupo encontrado."
                  disabled={isLoadingGroups}
                  error={!!errors.groupId}
                  helperText={errors.groupId?.message}
                />
              )}
            />
          </FormField>

          <FormField>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  value={field.value ? 'true' : 'false'}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  error={!!errors.isActive}
                  helperText={errors.isActive?.message}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </Select>
              )}
            />
          </FormField>
        </div>
      </FormSection>

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
