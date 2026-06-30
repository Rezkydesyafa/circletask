"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createActivityLog } from "@/features/activity-logs/log";
import {
  assertAssignedUser,
  assertGroupLeader,
  assertGroupMember,
  assertProjectInGroup,
  assertUserIsGroupMember,
  getTaskForAccess,
} from "@/features/permissions/server";
import type { ActionResult } from "@/features/shared/action-result";
import { getZodFieldErrors } from "@/features/shared/action-result";
import { getAuthenticatedBackend, getErrorMessage } from "@/features/shared/server";
import { assertTaskStatusTransition } from "@/features/tasks/state-machine";
import {
  createTaskSchema,
  taskCommentSchema,
  taskIdSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type TaskCommentInput,
  type TaskIdInput,
  type UpdateTaskInput,
} from "@/features/tasks/schemas";

type TaskMutationResult = {
  id: string;
};

function revalidateTaskPages(groupId: string, projectId: string, taskId?: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}/tasks`);

  if (taskId) {
    revalidatePath(`/groups/${groupId}/projects/${projectId}/tasks/${taskId}`);
  }
}

export async function createTaskAction(input: CreateTaskInput): Promise<ActionResult<TaskMutationResult>> {
  const parsedInput = createTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data task.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId, projectId, title, description, assignedTo, deadline, priority, weight } =
      parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);
    await assertProjectInGroup(supabase, projectId, groupId);
    await assertUserIsGroupMember(supabase, groupId, assignedTo);

    const taskId = randomUUID();
    const { error } = await supabase.from("tasks").insert({
      id: taskId,
      group_id: groupId,
      project_id: projectId,
      title,
      description,
      assigned_to: assignedTo,
      deadline: new Date(deadline).toISOString(),
      priority,
      weight,
      created_by: user.id,
      status: "todo",
    });

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId,
      projectId,
      taskId,
      userId: user.id,
      action: "task.created",
      description: "Task dibuat",
      metadata: { title, assigned_to: assignedTo },
    });

    await createActivityLog(supabase, {
      groupId,
      projectId,
      taskId,
      userId: user.id,
      action: "task.assigned",
      description: "Task diassign ke anggota",
      metadata: { assigned_to: assignedTo },
    });

    revalidateTaskPages(groupId, projectId, taskId);

    return {
      ok: true,
      data: { id: taskId },
      message: "Task berhasil dibuat.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal membuat task."),
    };
  }
}

export async function updateTaskAction(input: UpdateTaskInput): Promise<ActionResult<TaskMutationResult>> {
  const parsedInput = updateTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data task.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const {
      groupId,
      projectId,
      taskId,
      title,
      description,
      assignedTo,
      deadline,
      priority,
      weight,
    } = parsedInput.data;
    const currentTask = await getTaskForAccess(supabase, taskId);

    if (currentTask.group_id !== groupId || currentTask.project_id !== projectId) {
      throw new Error("Task tidak sesuai dengan group atau project.");
    }

    await assertGroupLeader(supabase, groupId, user.id);
    await assertProjectInGroup(supabase, projectId, groupId);
    await assertUserIsGroupMember(supabase, groupId, assignedTo);

    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        assigned_to: assignedTo,
        deadline: new Date(deadline).toISOString(),
        priority,
        weight,
      })
      .eq("id", taskId)
      .eq("group_id", groupId)
      .eq("project_id", projectId);

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId,
      projectId,
      taskId,
      userId: user.id,
      action: "task.updated",
      description: "Task diperbarui",
      metadata: { title, assigned_to: assignedTo },
    });

    if (currentTask.assigned_to !== assignedTo) {
      await createActivityLog(supabase, {
        groupId,
        projectId,
        taskId,
        userId: user.id,
        action: "task.assigned",
        description: "Assignment task diperbarui",
        metadata: { from_user_id: currentTask.assigned_to, to_user_id: assignedTo },
      });
    }

    revalidateTaskPages(groupId, projectId, taskId);

    return {
      ok: true,
      data: { id: taskId },
      message: "Task berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal memperbarui task."),
    };
  }
}

export async function markTaskInProgressAction(input: TaskIdInput): Promise<ActionResult<TaskMutationResult>> {
  const parsedInput = taskIdSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Task ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupMember(supabase, task.group_id, user.id);
    assertAssignedUser(task, user.id);

    assertTaskStatusTransition({
      from: task.status,
      to: "in_progress",
      actor: "assigned_member",
    });

    if (task.status !== "in_progress") {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", task.id);

      if (error) {
        throw new Error(error.message);
      }

      await createActivityLog(supabase, {
        groupId: task.group_id,
        projectId: task.project_id,
        taskId: task.id,
        userId: user.id,
        action: "task.status_changed",
        description: "Status task diubah menjadi in progress",
        metadata: { from: task.status, to: "in_progress" },
      });
    }

    revalidateTaskPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: task.id },
      message: "Status task berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal memperbarui status task."),
    };
  }
}

export async function markTaskDoneAction(input: TaskIdInput): Promise<ActionResult<TaskMutationResult>> {
  const parsedInput = taskIdSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Task ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupLeader(supabase, task.group_id, user.id);
    assertTaskStatusTransition({
      from: task.status,
      to: "done",
      actor: "leader",
    });

    const { error } = await supabase.from("tasks").update({ status: "done" }).eq("id", task.id);

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.done",
      description: "Task ditandai selesai setelah approval ketua",
      metadata: { from: task.status, to: "done" },
    });

    revalidateTaskPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: task.id },
      message: "Task berhasil ditandai selesai.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal menandai task selesai."),
    };
  }
}

export async function createTaskCommentAction(input: TaskCommentInput): Promise<ActionResult<TaskMutationResult>> {
  const parsedInput = taskCommentSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali komentar.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupMember(supabase, task.group_id, user.id);

    const commentId = randomUUID();
    const { error } = await supabase.from("task_comments").insert({
      id: commentId,
      task_id: task.id,
      user_id: user.id,
      comment: parsedInput.data.comment,
    });

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.comment_added",
      description: "Komentar task ditambahkan",
      metadata: { comment_id: commentId },
    });

    revalidateTaskPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: commentId },
      message: "Komentar berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal menambahkan komentar."),
    };
  }
}
