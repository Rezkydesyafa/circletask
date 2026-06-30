import "server-only";

import { isBefore, startOfDay } from "date-fns";

import type { GroupRole, TaskStatus } from "@/types/domain";
import type { GroupDashboardSummary, GroupListItem, GroupMemberItem } from "@/features/groups/types";
import { assertGroupMember } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

function normalizeGroupRow(row: {
  role: GroupRole;
  joined_at: string;
  groups:
    | {
        id: string;
        name: string;
        description: string | null;
        join_code: string;
        owner_id: string;
        created_at: string;
        updated_at: string;
      }
    | {
        id: string;
        name: string;
        description: string | null;
        join_code: string;
        owner_id: string;
        created_at: string;
        updated_at: string;
      }[];
}): GroupListItem | null {
  const group = Array.isArray(row.groups) ? row.groups[0] : row.groups;

  if (!group) {
    return null;
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    joinCode: group.join_code,
    ownerId: group.owner_id,
    role: row.role,
    joinedAt: row.joined_at,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
  };
}

export async function getUserGroups(): Promise<GroupListItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  const { data, error } = await supabase
    .from("group_members")
    .select("role, joined_at, groups(id, name, description, join_code, owner_id, created_at, updated_at)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Parameters<typeof normalizeGroupRow>[0][])
    .map(normalizeGroupRow)
    .filter((group): group is GroupListItem => Boolean(group));
}

export async function getGroupById(groupId: string): Promise<GroupListItem> {
  const { supabase, user } = await getAuthenticatedBackend();
  const role = await assertGroupMember(supabase, groupId, user.id);
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, description, join_code, owner_id, created_at, updated_at")
    .eq("id", groupId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    joinCode: data.join_code,
    ownerId: data.owner_id,
    role,
    joinedAt: "",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getGroupMembers(groupId: string): Promise<GroupMemberItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);

  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (membersError) {
    throw new Error(membersError.message);
  }

  const userIds = (members ?? []).map((member) => member.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, avatar_url")
    .in("user_id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileByUserId = new Map(
    (profiles ?? []).map((profile) => [
      profile.user_id,
      {
        fullName: profile.full_name as string,
        email: profile.email as string,
        avatarUrl: profile.avatar_url as string | null,
      },
    ])
  );

  return (members ?? []).map((member) => {
    const profile = profileByUserId.get(member.user_id);

    return {
      userId: member.user_id,
      role: member.role as GroupRole,
      joinedAt: member.joined_at,
      fullName: profile?.fullName ?? "Pengguna CircleTask",
      email: profile?.email ?? "-",
      avatarUrl: profile?.avatarUrl ?? null,
    };
  });
}

export async function getGroupDashboardSummary(groupId: string): Promise<GroupDashboardSummary> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);

  const group = await getGroupById(groupId);
  const [{ count: memberCount }, { count: projectCount }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase.from("group_members").select("id", { count: "exact", head: true }).eq("group_id", groupId),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("group_id", groupId),
      supabase.from("tasks").select("id, project_id, title, status, deadline").eq("group_id", groupId),
    ]);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const now = startOfDay(new Date());
  const taskRows = (tasks ?? []) as {
    id: string;
    project_id: string;
    title: string;
    status: TaskStatus;
    deadline: string;
  }[];
  const activeTasks = taskRows.filter((task) => !["approved", "done"].includes(task.status));
  const nearestDeadlineTask = [...activeTasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )[0];
  const approvedTaskCount = taskRows.filter((task) => task.status === "approved" || task.status === "done").length;
  const pendingReviewCount = taskRows.filter((task) => task.status === "submit_review").length;
  const overdueTaskCount = activeTasks.filter((task) =>
    isBefore(startOfDay(new Date(task.deadline)), now)
  ).length;

  return {
    group,
    memberCount: memberCount ?? 0,
    projectCount: projectCount ?? 0,
    taskCount: taskRows.length,
    approvedTaskCount,
    pendingReviewCount,
    overdueTaskCount,
    nearestDeadlineTask: nearestDeadlineTask
      ? {
          id: nearestDeadlineTask.id,
          projectId: nearestDeadlineTask.project_id,
          title: nearestDeadlineTask.title,
          deadline: nearestDeadlineTask.deadline,
        }
      : null,
  };
}
