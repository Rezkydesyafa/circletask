"use server";

import React from "react";
import type { Readable } from "node:stream";

import { pdf } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";

import { ContributionReportPDF } from "@/components/pdf/contribution-report-pdf";
import { createActivityLog } from "@/features/activity-logs/log";
import { assertGroupLeader } from "@/features/permissions/server";
import { getReportPreviewData } from "@/features/reports/queries";
import { reportExportSchema, type ReportExportInput } from "@/features/reports/schemas";
import type { ActionResult } from "@/features/shared/action-result";
import { getZodFieldErrors } from "@/features/shared/action-result";
import { getAuthenticatedBackend, getErrorMessage } from "@/features/shared/server";

type ReportExportResult = {
  groupId: string;
};

type ReportPdfExportResult = {
  filename: string;
  contentType: "application/pdf";
  base64: string;
};

async function readableToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream as Readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function getReportFilename(groupName: string) {
  const safeGroupName = groupName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `circletask-report-${safeGroupName || "group"}.pdf`;
}

export async function logReportExportAction(
  input: ReportExportInput
): Promise<ActionResult<ReportExportResult>> {
  const parsedInput = reportExportSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Group ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId } = parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);

    await createActivityLog(supabase, {
      groupId,
      userId: user.id,
      action: "report.exported",
      description: "Laporan kontribusi diexport",
      metadata: { exported_at: new Date().toISOString() },
    });

    revalidatePath(`/groups/${groupId}/activity`);
    revalidatePath(`/groups/${groupId}/report`);

    return {
      ok: true,
      data: { groupId },
      message: "Aktivitas export laporan berhasil dicatat.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal mencatat export laporan."),
    };
  }
}

export async function exportContributionReportAction(
  input: ReportExportInput
): Promise<ActionResult<ReportPdfExportResult>> {
  const parsedInput = reportExportSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Group ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId } = parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);

    const reportData = await getReportPreviewData(groupId);
    const document = React.createElement(ContributionReportPDF, {
      data: reportData,
    }) as Parameters<typeof pdf>[0];
    const stream = await pdf(document).toBuffer();
    const buffer = await readableToBuffer(stream);

    await createActivityLog(supabase, {
      groupId,
      userId: user.id,
      action: "report.exported",
      description: "Laporan kontribusi diexport",
      metadata: {
        exported_at: new Date().toISOString(),
        format: "pdf",
      },
    });

    revalidatePath(`/groups/${groupId}/activity`);
    revalidatePath(`/groups/${groupId}/report`);

    return {
      ok: true,
      data: {
        filename: getReportFilename(reportData.group.name),
        contentType: "application/pdf",
        base64: buffer.toString("base64"),
      },
      message: "Laporan PDF berhasil dibuat.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal membuat laporan PDF."),
    };
  }
}
