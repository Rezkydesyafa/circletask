import { z } from "zod";

export const reportExportSchema = z.object({
  groupId: z.string().uuid("Group ID tidak valid."),
});

export type ReportExportInput = z.input<typeof reportExportSchema>;

