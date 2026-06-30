export type TaskEvidenceItem = {
  id: string;
  taskId: string;
  uploadedBy: string;
  uploaderName: string;
  evidenceType: "file" | "link";
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  externalUrl: string | null;
  signedUrl: string | null;
  note: string | null;
  createdAt: string;
};

