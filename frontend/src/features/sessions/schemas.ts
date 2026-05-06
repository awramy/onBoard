import { z } from 'zod';

export const startSessionSchema = z.object({
  technologyId: z.string().min(1, 'errors.form.technologyRequired'),
  technologyLevelId: z.string().min(1, 'errors.form.levelRequired'),
  questionsCount: z
    .number()
    .min(5, 'errors.form.questionsCountRange')
    .max(20, 'errors.form.questionsCountRange'),
  model: z.string().min(1, 'errors.form.modelRequired'),
});

export type StartSessionFormValues = z.infer<typeof startSessionSchema>;
