import { z } from "zod";

import { ALLOWED_TASK_EVIDENCE_MIME_TYPES, MAX_TASK_EVIDENCE_FILE_SIZE } from "@/lib/upload";

const optionalNote = z
  .string()
  .trim()
  .max(500, "Catatan maksimal 500 karakter.")
  .optional()
  .transform((value) => (value ? value : null));

function isAllowedExternalEvidenceUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (
      host === "drive.google.com" ||
      host === "github.com" ||
      host.endsWith(".github.com") ||
      host === "figma.com" ||
      host.endsWith(".figma.com") ||
      host === "draw.io" ||
      host.endsWith(".draw.io") ||
      host === "diagrams.net" ||
      host.endsWith(".diagrams.net")
    );
  } catch {
    return false;
  }
}

export const externalEvidenceSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
  externalUrl: z
    .string()
    .trim()
    .url("Link bukti tidak valid.")
    .refine(isAllowedExternalEvidenceUrl, {
      message: "Link eksternal hanya boleh Google Drive, GitHub, Figma, atau draw.io.",
    }),
  note: optionalNote,
});

export const fileEvidenceMetadataSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
  filePath: z.string().min(1, "File path wajib diisi."),
  fileName: z
    .string()
    .trim()
    .min(1, "Nama file wajib diisi.")
    .regex(/\.(pdf|png|jpg|jpeg|docx)$/i, "Format file harus PDF, PNG, JPG, atau DOCX."),
  fileSize: z.coerce
    .number()
    .int("Ukuran file tidak valid.")
    .positive("Ukuran file harus lebih dari 0.")
    .max(MAX_TASK_EVIDENCE_FILE_SIZE, "Ukuran file maksimal 5 MB."),
  mimeType: z.enum(ALLOWED_TASK_EVIDENCE_MIME_TYPES),
  note: optionalNote,
});

export const evidenceIdSchema = z.object({
  evidenceId: z.string().uuid("Evidence ID tidak valid."),
});

export const replaceFileEvidenceMetadataSchema = fileEvidenceMetadataSchema.extend({
  evidenceId: z.string().uuid("Evidence ID tidak valid."),
});

export const createEvidenceUploadTargetSchema = z.object({
  taskId: z.string().uuid("Task ID tidak valid."),
  fileName: z
    .string()
    .trim()
    .min(1, "Nama file wajib diisi.")
    .regex(/\.(pdf|png|jpg|jpeg|docx)$/i, "Format file harus PDF, PNG, JPG, atau DOCX."),
  fileSize: z.coerce
    .number()
    .int("Ukuran file tidak valid.")
    .positive("Ukuran file harus lebih dari 0.")
    .max(MAX_TASK_EVIDENCE_FILE_SIZE, "Ukuran file maksimal 5 MB."),
  mimeType: z.enum(ALLOWED_TASK_EVIDENCE_MIME_TYPES),
});

export type ExternalEvidenceInput = z.input<typeof externalEvidenceSchema>;
export type FileEvidenceMetadataInput = z.input<typeof fileEvidenceMetadataSchema>;
export type EvidenceIdInput = z.input<typeof evidenceIdSchema>;
export type ReplaceFileEvidenceMetadataInput = z.input<typeof replaceFileEvidenceMetadataSchema>;
export type CreateEvidenceUploadTargetInput = z.input<typeof createEvidenceUploadTargetSchema>;
