import { z } from 'zod';

// Schema base para campos comuns
const baseUserSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  roles: z.array(z.string()).optional(),
});

// Validação de senha forte
const passwordValidation = z
  .string()
  .min(6, 'Senha deve conter ao menos 6 caracteres')
  .regex(/[A-Z]/, { message: 'Senha deve conter ao menos uma letra maiúscula' })
  .regex(/[a-z]/, { message: 'Senha deve conter ao menos uma letra minúscula' })
  .regex(/[0-9]/, { message: 'Senha deve conter ao menos um número' })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Senha deve conter ao menos um caractere especial',
  });

// Schema para criação de usuário (senha obrigatória)
export const createUserSchema = baseUserSchema
  .extend({
    password: passwordValidation,
    repeat_password: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: 'Senhas não coincidem',
    path: ['repeat_password'],
  });

// Schema para edição de usuário (senha opcional)
export const updateUserSchema = baseUserSchema
  .extend({
    password: passwordValidation.optional().or(z.literal('')),
    repeat_password: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Se senha foi preenchida, a confirmação deve ser igual
      if (data.password && data.password.length > 0) {
        return data.password === data.repeat_password;
      }
      return true;
    },
    {
      message: 'Senhas não coincidem',
      path: ['repeat_password'],
    }
  );

// Schema genérico (usado para tipagem)
export const userSchema = createUserSchema;

export type UserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
