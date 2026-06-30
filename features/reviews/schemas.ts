import { z } from "zod";

export const submitReviewSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
});

export const approveTaskSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
});

export const requestRevisionSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
  reviewNote: z
    .string()
    .trim()
    .min(1, "Catatan revisi wajib diisi.")
    .max(1000, "Catatan revisi maksimal 1000 karakter."),
});

export const reassignTaskSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
  toUserId: z.string().uuid("Anggota pengganti tidak valid."),
  reason: z
    .string()
    .trim()
    .min(1, "Alasan reassign wajib diisi.")
    .max(1000, "Alasan reassign maksimal 1000 karakter."),
});

export type SubmitReviewInput = z.input<typeof submitReviewSchema>;
export type ApproveTaskInput = z.input<typeof approveTaskSchema>;
export type RequestRevisionInput = z.input<typeof requestRevisionSchema>;
export type ReassignTaskInput = z.input<typeof reassignTaskSchema>;

