import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { FormSection } from '~/components/ui/form-section';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
import { FormField, Select } from '~/components/ui';
import type { User as UserType } from '~/types';

export default function UserForm({ user }: { user?: UserType }) {
  const navigate = useNavigate();
  const isEditMode = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          password: '',
          repeat_password: '',
        }
      : {
          name: '',
          email: '',
          password: '',
          repeat_password: '',
        },
  });

  const onSubmit = async (data: UserFormData | UpdateUserFormData) => {
    try {
      if (isEditMode) {
        // Remove senha vazia para não enviar ao backend
        const updateData = {
          name: data.name,
          email: data.email,
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
            <Input id="name" placeholder="ReoLinkWireless" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="email" className="text-form-label">
              Email
            </Label>
            <Input id="email" placeholder="start" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </FormField>

          <FormField className="space-y-2">
            <Label htmlFor="type" className="text-form-label">
              Senha
            </Label>
            <Input
              id="password"
              placeholder="h264"
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
              placeholder="h264"
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
      {/* ACTIONS */}
      {/* ===================== */}
      {/* <FormSection title="Configurações de perfil">
        <FormField className="space-y-2">
          <Label htmlFor="role" className="text-form-label">
            Perfil
          </Label>
          <Select id="role" {...register('role')}>
            {roles &&
              roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.description}
                </option>
              ))}
          </Select>
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </FormField>
      </FormSection> */}

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
