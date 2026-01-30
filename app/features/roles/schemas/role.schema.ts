import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  hierarchy: z.coerce.number().min(0, 'Hierarquia deve ser maior ou igual a 0').default(0),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
});

export type RoleFormData = z.infer<typeof roleSchema>;
