import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabaseTestEnv = Boolean(supabaseUrl && anonKey && serviceRoleKey);

type TestUser = {
  id: string;
  email: string;
  password: string;
  client: SupabaseClient;
};

function createSupabaseClient(key: string) {
  return createClient(supabaseUrl!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function createConfirmedUser(serviceClient: SupabaseClient, label: string): Promise<TestUser> {
  const password = `CircleTask-${randomUUID()}-1a`;
  const email = `circletask-${label}-${Date.now()}-${randomUUID()}@example.test`;
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `Smoke ${label}`,
    },
  });

  assert.ifError(error);
  assert.ok(data.user?.id);

  const client = createSupabaseClient(anonKey!);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(signInError);

  return {
    id: data.user.id,
    email,
    password,
    client,
  };
}

async function cleanup(serviceClient: SupabaseClient, input: { groupId?: string; filePath?: string; users: TestUser[] }) {
  if (input.filePath) {
    await serviceClient.storage.from("task-evidences").remove([input.filePath]);
  }

  if (input.groupId) {
    await serviceClient.from("groups").delete().eq("id", input.groupId);
  }

  for (const user of input.users) {
    await user.client.auth.signOut();
    await serviceClient.auth.admin.deleteUser(user.id);
  }
}

test(
  "Supabase MVP smoke: RPC, RLS, storage, evidence, review, approve, revision, reassign",
  { skip: !hasSupabaseTestEnv },
  async () => {
    const serviceClient = createSupabaseClient(serviceRoleKey!);
    const users: TestUser[] = [];
    let groupId: string | undefined;
    let filePath: string | undefined;

    try {
      const leader = await createConfirmedUser(serviceClient, "leader");
      const member = await createConfirmedUser(serviceClient, "member");
      const outsider = await createConfirmedUser(serviceClient, "outsider");
      users.push(leader, member, outsider);

      const updatedMemberPassword = `CircleTask-${randomUUID()}-2b`;
      const { error: updatePasswordError } = await member.client.auth.updateUser({
        password: updatedMemberPassword,
      });
      assert.ifError(updatePasswordError);
      await member.client.auth.signOut();

      const { error: oldPasswordError } = await member.client.auth.signInWithPassword({
        email: member.email,
        password: member.password,
      });
      assert.ok(oldPasswordError, "old password must not work after password update");

      const { error: newPasswordError } = await member.client.auth.signInWithPassword({
        email: member.email,
        password: updatedMemberPassword,
      });
      assert.ifError(newPasswordError);
      member.password = updatedMemberPassword;

      const { data: groupResult, error: groupError } = await leader.client.rpc("create_group_with_leader", {
        group_name: "Smoke Test Group",
        group_description: "Created by automated smoke test",
      });
      assert.ifError(groupError);
      groupId = (groupResult as { id: string; join_code: string }).id;
      const joinCode = (groupResult as { id: string; join_code: string }).join_code;
      assert.ok(groupId);
      assert.ok(joinCode);

      const { error: joinError } = await member.client.rpc("join_group_by_code", {
        target_join_code: joinCode,
      });
      assert.ifError(joinError);

      const { data: outsiderGroups, error: outsiderGroupError } = await outsider.client
        .from("groups")
        .select("id")
        .eq("id", groupId);
      assert.ifError(outsiderGroupError);
      assert.equal(outsiderGroups?.length, 0);

      const projectId = randomUUID();
      const { error: projectError } = await leader.client.from("projects").insert({
        id: projectId,
        group_id: groupId,
        title: "Smoke Project",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: leader.id,
      });
      assert.ifError(projectError);

      const taskId = randomUUID();
      const { error: taskError } = await leader.client.from("tasks").insert({
        id: taskId,
        group_id: groupId,
        project_id: projectId,
        title: "Smoke Task",
        assigned_to: member.id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        weight: 10,
        created_by: leader.id,
      });
      assert.ifError(taskError);

      const { error: inProgressError } = await member.client
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", taskId);
      assert.ifError(inProgressError);

      const { error: memberDoneError } = await member.client
        .from("tasks")
        .update({ status: "done" })
        .eq("id", taskId);
      assert.ok(memberDoneError, "member must not set task to done");

      const { error: memberMetadataError } = await member.client
        .from("tasks")
        .update({ title: "Illegal title update" })
        .eq("id", taskId);
      assert.ok(memberMetadataError, "member must not edit task metadata");

      const { error: evidenceError } = await member.client.from("task_evidences").insert({
        id: randomUUID(),
        task_id: taskId,
        uploaded_by: member.id,
        evidence_type: "link",
        external_url: "https://github.com/example/circletask",
      });
      assert.ifError(evidenceError);

      filePath = `${groupId}/${projectId}/${taskId}/smoke.pdf`;
      const pdfBlob = new Blob(["%PDF-1.4\n% smoke test\n"], { type: "application/pdf" });
      const { error: uploadError } = await member.client.storage
        .from("task-evidences")
        .upload(filePath, pdfBlob, { contentType: "application/pdf", upsert: false });
      assert.ifError(uploadError);

      const { error: fileEvidenceError } = await member.client.from("task_evidences").insert({
        id: randomUUID(),
        task_id: taskId,
        uploaded_by: member.id,
        evidence_type: "file",
        file_path: filePath,
        file_name: "smoke.pdf",
        file_size: 24,
      });
      assert.ifError(fileEvidenceError);

      const { error: outsiderDownloadError } = await outsider.client.storage
        .from("task-evidences")
        .download(filePath);
      assert.ok(outsiderDownloadError, "outsider must not read private task evidence file");

      const removableFilePath = `${groupId}/${projectId}/${taskId}/smoke-delete.pdf`;
      const { error: removableUploadError } = await member.client.storage
        .from("task-evidences")
        .upload(removableFilePath, pdfBlob, { contentType: "application/pdf", upsert: false });
      assert.ifError(removableUploadError);

      const { error: memberRemoveStorageError } = await member.client.storage
        .from("task-evidences")
        .remove([removableFilePath]);
      assert.ifError(memberRemoveStorageError);

      const { error: submitReviewError } = await member.client
        .from("tasks")
        .update({ status: "submit_review" })
        .eq("id", taskId);
      assert.ifError(submitReviewError);

      const { error: forbiddenMemberReviewError } = await member.client.from("task_reviews").insert({
        id: randomUUID(),
        task_id: taskId,
        reviewed_by: member.id,
        review_status: "approved",
      });
      assert.ok(forbiddenMemberReviewError, "member must not create review rows");

      const revisionId = randomUUID();
      const { error: revisionReviewError } = await leader.client.from("task_reviews").insert({
        id: revisionId,
        task_id: taskId,
        reviewed_by: leader.id,
        review_status: "revision",
        review_note: "Perbaiki bukti smoke test.",
      });
      assert.ifError(revisionReviewError);

      const { error: revisionTaskError } = await leader.client
        .from("tasks")
        .update({ status: "revision", approved_by: null, approved_at: null })
        .eq("id", taskId);
      assert.ifError(revisionTaskError);

      const { error: resubmitReviewError } = await member.client
        .from("tasks")
        .update({ status: "submit_review" })
        .eq("id", taskId);
      assert.ifError(resubmitReviewError);

      const approvedAt = new Date().toISOString();
      const { error: approveReviewError } = await leader.client.from("task_reviews").insert({
        id: randomUUID(),
        task_id: taskId,
        reviewed_by: leader.id,
        review_status: "approved",
      });
      assert.ifError(approveReviewError);

      const { error: approveTaskError } = await leader.client
        .from("tasks")
        .update({ status: "approved", approved_by: leader.id, approved_at: approvedAt })
        .eq("id", taskId);
      assert.ifError(approveTaskError);

      const reassignTaskId = randomUUID();
      const { error: reassignBaseTaskError } = await leader.client.from("tasks").insert({
        id: reassignTaskId,
        group_id: groupId,
        project_id: projectId,
        title: "Smoke Reassign Task",
        assigned_to: member.id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "low",
        weight: 5,
        created_by: leader.id,
      });
      assert.ifError(reassignBaseTaskError);

      const { error: forbiddenMemberReassignError } = await member.client.from("task_reassignments").insert({
        id: randomUUID(),
        task_id: reassignTaskId,
        from_user_id: member.id,
        to_user_id: leader.id,
        reassigned_by: member.id,
        reason: "Member should not reassign",
      });
      assert.ok(forbiddenMemberReassignError, "member must not create reassign rows");

      const { error: reassignHistoryError } = await leader.client.from("task_reassignments").insert({
        id: randomUUID(),
        task_id: reassignTaskId,
        from_user_id: member.id,
        to_user_id: leader.id,
        reassigned_by: leader.id,
        reason: "Smoke test reassign",
      });
      assert.ifError(reassignHistoryError);

      const { error: reassignTaskError } = await leader.client
        .from("tasks")
        .update({ assigned_to: leader.id, status: "todo" })
        .eq("id", reassignTaskId);
      assert.ifError(reassignTaskError);
    } finally {
      await cleanup(serviceClient, { groupId, filePath, users });
    }
  }
);
