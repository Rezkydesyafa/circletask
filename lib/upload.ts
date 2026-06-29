export const TASK_EVIDENCE_BUCKET = "task-evidences";
export const MAX_TASK_EVIDENCE_FILES = 3;
export const MAX_TASK_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_TASK_EVIDENCE_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export function getTaskEvidencePath(input: {
  groupId: string;
  projectId: string;
  taskId: string;
  filename: string;
}) {
  return `${input.groupId}/${input.projectId}/${input.taskId}/${input.filename}`;
}
