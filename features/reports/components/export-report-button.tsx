"use client";

import { useState, useTransition } from "react";

import { exportContributionReportAction } from "@/features/reports/actions";

type ExportReportButtonProps = {
  groupId: string;
};

export function ExportReportButton({ groupId }: ExportReportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);

    startTransition(async () => {
      const result = await exportContributionReportAction({ groupId });

      if (!result.ok || !result.data) {
        setError(result.message ?? "Gagal membuat laporan PDF.");
        return;
      }

      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let index = 0; index < byteCharacters.length; index += 1) {
        byteNumbers[index] = byteCharacters.charCodeAt(index);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: result.data.contentType,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        className="h-11 rounded-full bg-primary px-5 font-button text-button text-on-primary shadow-md transition-colors hover:bg-inverse-surface disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={handleExport}
        type="button"
      >
        {isPending ? "Membuat PDF..." : "Export PDF"}
      </button>
      {error ? <p className="font-body-sm text-body-sm text-destructive">{error}</p> : null}
    </div>
  );
}
