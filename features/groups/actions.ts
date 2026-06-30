"use server";

import { revalidatePath } from "next/cache";

import { createActivityLog } from "@/features/activity-logs/log";
import { assertGroupLeader, getGroupRole } from "@/features/permissions/server";
import type { ActionResult } from "@/features/shared/action-result";
import { getZodFieldErrors } from "@/features/shared/action-result";
import { getAuthenticatedBackend, getErrorMessage } from "@/features/shared/server";
import {
  createGroupSchema,
  joinGroupSchema,
  removeGroupMemberSchema,
  updateGroupSchema,
  type CreateGroupInput,
  type JoinGroupInput,
  type RemoveGroupMemberInput,
  type UpdateGroupInput,
} from "@/features/groups/schemas";

type GroupMutationResult = {
  id: string;
  joinCode?: string;
};

function getRpcGroupResult(data: unknown): GroupMutationResult {
  const payload = data as { id?: string; join_code?: string } | null;

  if (!payload?.id) {
    throw new Error("Response Supabase tidak valid.");
  }

  return {
    id: payload.id,
    joinCode: payload.join_code,
  };
}

function revalidateGroupPages(groupId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/groups");

  if (groupId) {
    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/groups/${groupId}/members`);
  }
}

export async function createGroupAction(input: CreateGroupInput): Promise<ActionResult<GroupMutationResult>> {
  const parsedInput = createGroupSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data kelompok.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase } = await getAuthenticatedBackend();
    const { data, error } = await supabase.rpc("create_group_with_leader", {
      group_name: parsedInput.data.name,
      group_description: parsedInput.data.description,
    });

    if (error) {
      throw new Error(error.message);
    }

    const group = getRpcGroupResult(data);
    revalidateGroupPages(group.id);

    return {
      ok: true,
      data: group,
      message: "Kelompok berhasil dibuat.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal membuat kelompok."),
    };
  }
}

export async function joinGroupAction(input: JoinGroupInput): Promise<ActionResult<GroupMutationResult>> {
  const parsedInput = joinGroupSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali kode join.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase } = await getAuthenticatedBackend();
    const { data, error } = await supabase.rpc("join_group_by_code", {
      target_join_code: parsedInput.data.joinCode,
    });

    if (error) {
      throw new Error(error.message);
    }

    const group = getRpcGroupResult(data);
    revalidateGroupPages(group.id);

    return {
      ok: true,
      data: group,
      message: "Berhasil bergabung ke kelompok.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal join kelompok."),
    };
  }
}

export async function updateGroupAction(input: UpdateGroupInput): Promise<ActionResult<GroupMutationResult>> {
  const parsedInput = updateGroupSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data kelompok.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId, name, description } = parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);

    const { error } = await supabase
      .from("groups")
      .update({ name, description })
      .eq("id", groupId);

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId,
      userId: user.id,
      action: "group.updated",
      description: "Data kelompok diperbarui",
      metadata: { name },
    });

    revalidateGroupPages(groupId);

    return {
      ok: true,
      data: { id: groupId },
      message: "Kelompok berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal memperbarui kelompok."),
    };
  }
}

export async function removeGroupMemberAction(
  input: RemoveGroupMemberInput
): Promise<ActionResult<GroupMutationResult>> {
  const parsedInput = removeGroupMemberSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data anggota.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const { groupId, userId } = parsedInput.data;
    await assertGroupLeader(supabase, groupId, user.id);

    if (userId === user.id) {
      throw new Error("Ketua tidak bisa menghapus dirinya sendiri dari kelompok.");
    }

    const targetRole = await getGroupRole(supabase, groupId, userId);

    if (!targetRole) {
      throw new Error("Anggota tidak ditemukan di kelompok ini.");
    }

    if (targetRole === "leader") {
      throw new Error("Ketua kelompok tidak bisa dihapus dari kelompok.");
    }

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId,
      userId: user.id,
      action: "group.member_removed",
      description: "Anggota dihapus dari kelompok",
      metadata: { removed_user_id: userId },
    });

    revalidateGroupPages(groupId);

    return {
      ok: true,
      data: { id: groupId },
      message: "Anggota berhasil dihapus dari kelompok.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal menghapus anggota."),
    };
  }
}
