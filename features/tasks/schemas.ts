import { z } from "zod";

import { TASK_PRIORITIES } from "@/types/domain";

const optionalDescription = z
  .string()
  .trim()
  .max(1500, "Deskripsi maksimal 1500 karakter.")
  .optional()
  .transform((value) => (value ? value : null));

export const createTaskSchema = z.object({
  groupId: z.string().uuid("Group ID tidak valid."),
  projectId: z.string().uuid("Project ID tidak valid."),
  title: z
    .string()
    .trim()
    .min(2, "Judul task minimal 2 karakter.")
    .max(120, "Judul task maksimal 120 karakter."),
  description: optionalDescription,
  assignedTo: z.string().uuid("Assigned user tidak valid."),
  deadline: z.string().min(1, "Deadline wajib diisi.").refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Deadline tidak valid.",
  }),
  priority: z.enum(TASK_PRIORITIES),
  weight: z.coerce.number().positive("Weight harus lebih dari 0.").max(10000, "Weight terlalu besar."),
});

export const taskIdSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
});

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().uuid("Task ID tidak valid."),
});

export const taskCommentSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
  comment: z
    .string()
    .trim()
    .min(1, "Komentar wajib diisi.")
    .max(1000, "Komentar maksimal 1000 karakter."),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type TaskIdInput = z.input<typeof taskIdSchema>;
export type TaskCommentInput = z.input<typeof taskCommentSchema>;
