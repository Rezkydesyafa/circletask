import { z } from "zod";

const optionalDescription = z
  .string()
  .trim()
  .max(500, "Deskripsi maksimal 500 karakter.")
  .optional()
  .transform((value) => (value ? value : null));

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kelompok minimal 2 karakter.")
    .max(100, "Nama kelompok maksimal 100 karakter."),
  description: optionalDescription,
});

export const joinGroupSchema = z.object({
  joinCode: z
    .string()
    .trim()
    .min(4, "Kode join wajib diisi.")
    .max(20, "Kode join terlalu panjang.")
    .transform((value) => value.toUpperCase()),
});

export const groupIdSchema = z.string().uuid("Group ID tidak valid.");

export const updateGroupSchema = z.object({
  groupId: groupIdSchema,
  name: z
    .string()
    .trim()
    .min(2, "Nama kelompok minimal 2 karakter.")
    .max(100, "Nama kelompok maksimal 100 karakter."),
  description: optionalDescription,
});

export const removeGroupMemberSchema = z.object({
  groupId: groupIdSchema,
  userId: z.string().uuid("User ID tidak valid."),
});

export type CreateGroupInput = z.input<typeof createGroupSchema>;
export type JoinGroupInput = z.input<typeof joinGroupSchema>;
export type UpdateGroupInput = z.input<typeof updateGroupSchema>;
export type RemoveGroupMemberInput = z.input<typeof removeGroupMemberSchema>;
