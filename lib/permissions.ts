import type { GroupRole } from "@/types/domain";

export function isGroupLeader(role: GroupRole | null | undefined) {
  return role === "leader";
}

export function isGroupMember(role: GroupRole | null | undefined) {
  return role === "leader" || role === "member";
}
