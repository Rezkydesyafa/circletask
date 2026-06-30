import { z } from "zod";

const optionalDescription = z
  .string()
  .trim()
  .max(1000, "Deskripsi maksimal 1000 karakter.")
  .optional()
  .transform((value) => (value ? value : null));

export const createProjectSchema = z.object({
  groupId: z.string().uuid("Group ID tidak valid."),
  title: z
    .string()
    .trim()
    .min(2, "Judul project minimal 2 karakter.")
    .max(120, "Judul project maksimal 120 karakter."),
  description: optionalDescription,
  deadline: z.string().min(1, "Deadline wajib diisi.").refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Deadline tidak valid.",
  }),
});

export const projectParamsSchema = z.object({
  groupId: z.string().uuid("Group ID tidak valid."),
  projectId: z.string().uuid("Project ID tidak valid."),
});

export const updateProjectSchema = createProjectSchema.extend({
  projectId: z.string().uuid("Project ID tidak valid."),
});

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
