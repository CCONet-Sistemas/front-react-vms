import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email({error: 'Email inválido'}),
  password: z.string().min(6, 'Senha deve conter ao menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
