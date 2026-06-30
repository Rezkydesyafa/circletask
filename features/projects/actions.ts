"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createActivityLog } from "@/features/activity-logs/log";
import { assertGroupLeader } from "@/features/permissions/server";
import type { ActionResult } from "@/features/shared/action-result";
import { getZodFieldErrors } from "@/features/shared/action-result";
import { getAuthenticatedBackend, getErrorMessage } from "@/features/shared/server";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/features/projects/schemas";

type CreateProjectResult = {
  id: string;
};

function revalidateProjectPages(groupId: string, projectId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/projects`);

  if (projectId) {
    revalidatePath(`/groups/${groupId}/projects/${projectId}`);
  }
}

export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult<CreateProjectResult>> {
  const parsedInput = createProjectSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data project.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId, title, description, deadline } = parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);

    const projectId = randomUUID();
    const { error } = await supabase.from("projects").insert({
      id: projectId,
      group_id: groupId,
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      created_by: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId,
      projectId,
      userId: user.id,
      action: "project.created",
      description: "Project dibuat",
      metadata: { title },
    });

    revalidateProjectPages(groupId, projectId);

    return {
      ok: true,
      data: { id: projectId },
      message: "Project berhasil dibuat.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal membuat project."),
    };
  }
}

export async function updateProjectAction(input: UpdateProjectInput): Promise<ActionResult<CreateProjectResult>> {
  const parsedInput = updateProjectSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data project.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId, projectId, title, description, deadline } = parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        description,
        deadline: new Date(deadline).toISOString(),
      })
      .eq("id", projectId)
      .eq("group_id", groupId);

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId,
      projectId,
      userId: user.id,
      action: "project.updated",
      description: "Project diperbarui",
      metadata: { title },
    });

    revalidateProjectPages(groupId, projectId);

    return {
      ok: true,
      data: { id: projectId },
      message: "Project berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal memperbarui project."),
    };
  }
}
