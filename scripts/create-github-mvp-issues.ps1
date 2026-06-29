param(
  [Parameter(Mandatory = $true)]
  [string]$Repo,

  [string]$ProjectOwner = "",

  [int]$ProjectNumber = 0,

  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Invoke-Gh {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  if ($DryRun) {
    Write-Host ("gh " + ($Arguments -join " "))
    return ""
  }

  & gh @Arguments
}

function Ensure-GhAuth {
  if ($DryRun) {
    return
  }

  $ghCommand = Get-Command gh -ErrorAction SilentlyContinue
  if (-not $ghCommand) {
    throw "GitHub CLI 'gh' tidak ditemukan. Install GitHub CLI lalu jalankan 'gh auth login'."
  }

  & gh auth status | Out-Null
}

function Ensure-Label {
  param(
    [string]$Name,
    [string]$Color,
    [string]$Description
  )

  Invoke-Gh @(
    "label", "create", $Name,
    "--repo", $Repo,
    "--color", $Color,
    "--description", $Description,
    "--force"
  ) | Out-Null
}

function Ensure-Milestone {
  param(
    [string]$Title,
    [string]$Description
  )

  if ($DryRun) {
    Write-Host "ensure milestone: $Title"
    return
  }

  $query = ".[] | select(.title==`"$Title`") | .number"
  $existing = & gh api "repos/$Repo/milestones?state=all" --jq $query

  if ($existing) {
    Write-Host "Milestone exists: $Title"
    return
  }

  Invoke-Gh @(
    "api", "repos/$Repo/milestones",
    "-f", "title=$Title",
    "-f", "description=$Description",
    "-f", "state=open"
  ) | Out-Null
}

function Add-IssueToProject {
  param(
    [string]$IssueUrl
  )

  if (-not $IssueUrl) {
    return
  }

  if ($ProjectOwner -eq "" -or $ProjectNumber -le 0) {
    return
  }

  Invoke-Gh @(
    "project", "item-add", "$ProjectNumber",
    "--owner", $ProjectOwner,
    "--url", $IssueUrl
  ) | Out-Null
}

Ensure-GhAuth

$labels = @(
  @{ Name = "priority:high"; Color = "d73a4a"; Description = "High priority MVP work" },
  @{ Name = "priority:medium"; Color = "fbca04"; Description = "Medium priority MVP work" },
  @{ Name = "type:setup"; Color = "cfd3d7"; Description = "Project setup or tooling" },
  @{ Name = "type:feature"; Color = "0e8a16"; Description = "User-facing feature" },
  @{ Name = "type:security"; Color = "b60205"; Description = "Auth, permission, RLS, or storage security" },
  @{ Name = "type:ui"; Color = "1d76db"; Description = "UI implementation" },
  @{ Name = "type:database"; Color = "5319e7"; Description = "Database schema, migration, RLS, or storage policy" },
  @{ Name = "type:testing"; Color = "006b75"; Description = "Testing and QA" },
  @{ Name = "type:deployment"; Color = "0052cc"; Description = "Deployment and release work" },
  @{ Name = "area:app"; Color = "ededed"; Description = "Application shell and routing" },
  @{ Name = "area:auth"; Color = "ededed"; Description = "Authentication and profile" },
  @{ Name = "area:supabase"; Color = "ededed"; Description = "Supabase database, storage, and RLS" },
  @{ Name = "area:groups"; Color = "ededed"; Description = "Groups and members" },
  @{ Name = "area:projects"; Color = "ededed"; Description = "Projects" },
  @{ Name = "area:tasks"; Color = "ededed"; Description = "Tasks and task board" },
  @{ Name = "area:evidences"; Color = "ededed"; Description = "Task evidence upload and links" },
  @{ Name = "area:reviews"; Color = "ededed"; Description = "Task review and validation" },
  @{ Name = "area:comments"; Color = "ededed"; Description = "Task comments" },
  @{ Name = "area:activity"; Color = "ededed"; Description = "Activity logs" },
  @{ Name = "area:contributions"; Color = "ededed"; Description = "Contribution scoring" },
  @{ Name = "area:reports"; Color = "ededed"; Description = "PDF reports" },
  @{ Name = "area:release"; Color = "ededed"; Description = "Testing, deployment, and release" },
  @{ Name = "sprint:1"; Color = "bfdadc"; Description = "Sprint 1 - Foundation" },
  @{ Name = "sprint:2"; Color = "bfdadc"; Description = "Sprint 2 - Groups and Projects" },
  @{ Name = "sprint:3"; Color = "bfdadc"; Description = "Sprint 3 - Task Management" },
  @{ Name = "sprint:4"; Color = "bfdadc"; Description = "Sprint 4 - Evidence and Review" },
  @{ Name = "sprint:5"; Color = "bfdadc"; Description = "Sprint 5 - Contribution Report and Release" }
)

foreach ($label in $labels) {
  Ensure-Label -Name $label.Name -Color $label.Color -Description $label.Description
}

$milestones = @(
  @{
    Title = "Sprint 1 - Foundation"
    Description = "Project can run locally, auth baseline is ready, schema/RLS baseline is clear, and dashboard shell exists."
  },
  @{
    Title = "Sprint 2 - Groups and Projects"
    Description = "Users can create/join groups, view members, and leaders can create projects."
  },
  @{
    Title = "Sprint 3 - Task Management"
    Description = "Leaders can create tasks and members can work on assigned tasks with safe status transitions."
  },
  @{
    Title = "Sprint 4 - Evidence and Review"
    Description = "Members can upload evidence and submit review; leaders can approve, request revision, reassign, and view activity logs."
  },
  @{
    Title = "Sprint 5 - Contribution Report and Release"
    Description = "Contribution scoring, report preview, PDF export, testing, and Vercel deployment are complete."
  }
)

foreach ($milestone in $milestones) {
  Ensure-Milestone -Title $milestone.Title -Description $milestone.Description
}

$issues = @(
  @{
    Title = "Setup Next.js App Router, TypeScript, Tailwind, and project config"
    Milestone = "Sprint 1 - Foundation"
    Labels = @("sprint:1", "priority:high", "type:setup", "area:app")
    Body = @'
## Objective
Initialize the CircleTask app foundation so all MVP features can be built on a clean Next.js App Router stack.

## Tasks
- Setup or verify Next.js App Router structure.
- Setup TypeScript config and import alias `@/`.
- Setup Tailwind CSS config and global styles.
- Add base package scripts for dev, build, lint, and typecheck.
- Keep existing docs as the main project context.

## Acceptance Criteria
- App can run locally with the expected dev command.
- TypeScript path alias `@/` works.
- Tailwind styles load in `app/globals.css`.
- No business feature logic is added in this issue.

## Notes
- Follow `docs/PRD.md` and `docs/ui-and-agent-guidelines.md`.
'@
  },
  @{
    Title = "Setup shadcn/ui theme, base layout, and reusable UI primitives"
    Milestone = "Sprint 1 - Foundation"
    Labels = @("sprint:1", "priority:high", "type:ui", "area:app")
    Body = @'
## Objective
Prepare the UI foundation using shadcn/ui and the Google Stitch design direction.

## Tasks
- Configure shadcn/ui.
- Setup base theme tokens.
- Prepare reusable UI primitives needed for MVP.
- Add placeholder layout components only when needed by real pages.
- Keep UI clean, minimal, responsive, and student-friendly.

## Acceptance Criteria
- shadcn/ui components can be generated and imported.
- Base app layout renders without visual errors.
- UI direction follows Google Stitch, not a new style from scratch.

## Notes
- Do not build a marketing-heavy app shell.
- Dashboard UI should be practical and SaaS-like.
'@
  },
  @{
    Title = "Setup Supabase clients, env contract, and database migration baseline"
    Milestone = "Sprint 1 - Foundation"
    Labels = @("sprint:1", "priority:high", "type:setup", "type:database", "area:supabase")
    Body = @'
## Objective
Prepare Supabase integration for auth, database, storage, and RLS-backed access.

## Tasks
- Create browser and server Supabase client helpers.
- Define required environment variables in `.env.example`.
- Prepare migration structure under `supabase/migrations`.
- Document local and hosted Supabase setup notes if needed.
- Do not use service role key in client code.

## Acceptance Criteria
- Supabase client can be imported from server and client contexts safely.
- Public anon key usage is separated from server-only secrets.
- `.env.example` does not expose real secrets.

## Notes
- All future data access must assume RLS is enabled.
'@
  },
  @{
    Title = "Implement Supabase Auth register, login, logout, and profile bootstrap"
    Milestone = "Sprint 1 - Foundation"
    Labels = @("sprint:1", "priority:high", "type:feature", "area:auth")
    Body = @'
## Objective
Allow users to register, login, logout, and get a profile record for MVP flows.

## Tasks
- Build register form with React Hook Form and Zod.
- Build login form with React Hook Form and Zod.
- Implement logout action.
- Create or sync `profiles` record after registration/login.
- Add basic profile fields: full name, email, optional avatar URL.

## Acceptance Criteria
- User can register with email and password.
- User can login and logout.
- User profile exists after onboarding.
- Invalid form input shows clear errors.
- Auth pages remain public routes.

## Notes
- Do not add role dosen or academic grading.
'@
  },
  @{
    Title = "Implement protected dashboard shell and route guard"
    Milestone = "Sprint 1 - Foundation"
    Labels = @("sprint:1", "priority:high", "type:feature", "type:security", "area:app", "area:auth")
    Body = @'
## Objective
Protect authenticated app routes and provide the dashboard shell used by MVP screens.

## Tasks
- Implement protected route behavior for dashboard routes.
- Build dashboard layout shell with sidebar/header/mobile nav.
- Add loading and empty states for initial dashboard.
- Redirect unauthenticated users to login.

## Acceptance Criteria
- Guest cannot access `/dashboard`, `/groups/*`, or `/profile`.
- Logged-in user can access dashboard shell.
- Route guard is server-side aware, not only UI-based.
- Layout is responsive.

## Notes
- Keep dashboard data minimal until group/task features exist.
'@
  },
  @{
    Title = "Implement base database schema, RLS helpers, and storage bucket plan"
    Milestone = "Sprint 1 - Foundation"
    Labels = @("sprint:1", "priority:high", "type:database", "type:security", "area:supabase")
    Body = @'
## Objective
Create the database and security baseline for the CircleTask MVP.

## Tasks
- Create migrations for `profiles`, `groups`, `group_members`, `projects`, `tasks`, `task_evidences`, `task_comments`, `task_reviews`, `task_reassignments`, and `activity_logs`.
- Add enum constraints for task status, priority, group role, and review status.
- Prepare RLS policies based on group membership.
- Prepare storage bucket policy plan for `task-evidences`.
- Add helper functions only when they reduce duplicated RLS logic.

## Acceptance Criteria
- Tables match `docs/technical-spec.md`.
- RLS prevents users outside a group from reading group data.
- Service role key is not required by client code.
- Storage bucket rules are documented or implemented.

## Notes
- This issue may be split if migration and RLS become too large.
'@
  },
  @{
    Title = "Implement create group flow with join code and leader membership"
    Milestone = "Sprint 2 - Groups and Projects"
    Labels = @("sprint:2", "priority:high", "type:feature", "area:groups")
    Body = @'
## Objective
Allow a logged-in user to create a group and automatically become the group leader.

## Tasks
- Build create group page and form.
- Generate unique join code.
- Insert `groups` record.
- Insert `group_members` record with role `leader`.
- Create activity log for group creation.

## Acceptance Criteria
- User can create a group with name and optional description.
- Creator becomes `leader`.
- Join code is generated and visible to leader.
- Group appears in the user's group list.

## Notes
- Do not add lecturer or class management concepts.
'@
  },
  @{
    Title = "Implement join group flow and membership validation"
    Milestone = "Sprint 2 - Groups and Projects"
    Labels = @("sprint:2", "priority:high", "type:feature", "area:groups")
    Body = @'
## Objective
Allow logged-in users to join a group using a valid join code.

## Tasks
- Build join group page and form.
- Validate join code.
- Insert `group_members` with role `member`.
- Prevent duplicate membership.
- Show useful error state for invalid code.

## Acceptance Criteria
- User can join a group with valid code.
- User cannot join the same group twice.
- Invalid code returns a clear error.
- Joined group appears in dashboard/group list.

## Notes
- Joining a group never makes the user a leader.
'@
  },
  @{
    Title = "Implement groups list, group dashboard, and members page"
    Milestone = "Sprint 2 - Groups and Projects"
    Labels = @("sprint:2", "priority:high", "type:feature", "type:ui", "area:groups")
    Body = @'
## Objective
Give users a clear group workspace and member visibility.

## Tasks
- Build `/groups` list page.
- Build `/groups/[groupId]` group dashboard.
- Build `/groups/[groupId]/members` page.
- Show role badge for leader/member.
- Gate leader-only actions in UI and server.

## Acceptance Criteria
- User only sees groups they belong to.
- Group dashboard loads group summary.
- Members page shows members and roles.
- User outside group cannot access pages.

## Notes
- Member removal can be minimal if required by MVP, but must be leader-only.
'@
  },
  @{
    Title = "Implement create/list/detail project flow with project progress summary"
    Milestone = "Sprint 2 - Groups and Projects"
    Labels = @("sprint:2", "priority:high", "type:feature", "area:projects")
    Body = @'
## Objective
Allow leaders to create projects and members to view group project progress.

## Tasks
- Build project list page.
- Build create project form for leaders.
- Build project detail page.
- Add basic progress summary from task counts.
- Add empty state when no project exists.

## Acceptance Criteria
- Only group leader can create project.
- Group members can view project list and detail.
- Project requires title and deadline.
- User outside group cannot access project data.

## Notes
- Project progress can be simple until task feature is complete.
'@
  },
  @{
    Title = "Implement create task flow with assignment, priority, deadline, and weight"
    Milestone = "Sprint 3 - Task Management"
    Labels = @("sprint:3", "priority:high", "type:feature", "area:tasks")
    Body = @'
## Objective
Allow leaders to create structured tasks assigned to group members.

## Tasks
- Build create task page/form.
- Validate title, project, assigned user, deadline, priority, and weight.
- Restrict creation to group leader.
- Set initial status to `todo`.
- Create activity log for task creation and assignment.

## Acceptance Criteria
- Leader can create a task for a project.
- Assigned user must be a group member.
- Priority only supports low, medium, high.
- Weight must be positive.
- Member cannot create task unless explicitly allowed later outside MVP.

## Notes
- Follow `docs/technical-spec.md` for status and priority values.
'@
  },
  @{
    Title = "Implement task board and task cards by status"
    Milestone = "Sprint 3 - Task Management"
    Labels = @("sprint:3", "priority:high", "type:feature", "type:ui", "area:tasks")
    Body = @'
## Objective
Provide a task board that makes project progress easy to scan.

## Tasks
- Build `/groups/[groupId]/projects/[projectId]/tasks`.
- Group tasks by status.
- Add task cards with title, assignee, deadline, priority, and status.
- Add overdue label.
- Add empty states for no tasks.

## Acceptance Criteria
- Group members can view tasks for their group project.
- Task cards clearly show status and priority.
- Overdue tasks are visually distinct.
- User outside group cannot see tasks.

## Notes
- Drag and drop is optional and not required for MVP.
'@
  },
  @{
    Title = "Implement task detail and safe status transitions for assigned members"
    Milestone = "Sprint 3 - Task Management"
    Labels = @("sprint:3", "priority:high", "type:feature", "type:security", "area:tasks")
    Body = @'
## Objective
Allow assigned members to work on tasks without bypassing leader validation.

## Tasks
- Build task detail page.
- Show task metadata, assignee, deadline, status, priority, and weight.
- Allow assigned member to change status to `in_progress`.
- Prevent member from setting task directly to `done`.
- Create activity log on status change.

## Acceptance Criteria
- Assigned member can mark task as `in_progress`.
- Member cannot set status to `done`.
- User outside group cannot access task detail.
- Status changes are validated server-side.

## Notes
- Submit review is handled in Sprint 4 after evidence upload.
'@
  },
  @{
    Title = "Implement task comments"
    Milestone = "Sprint 3 - Task Management"
    Labels = @("sprint:3", "priority:medium", "type:feature", "area:comments", "area:tasks")
    Body = @'
## Objective
Allow group members to discuss task context, revisions, and clarifications in the task detail page.

## Tasks
- Add comment form to task detail.
- Save comments to `task_comments`.
- Show comments chronologically.
- Create activity log when comment is added.
- Restrict comments to group members.

## Acceptance Criteria
- Group member can comment on group task.
- User outside group cannot read or create comments.
- Empty comment is rejected.
- Comment list updates after submit.

## Notes
- This is not full realtime chat.
'@
  },
  @{
    Title = "Implement task permission checks and server action guard coverage"
    Milestone = "Sprint 3 - Task Management"
    Labels = @("sprint:3", "priority:high", "type:security", "area:tasks", "area:supabase")
    Body = @'
## Objective
Harden task-related mutations so business rules are enforced on the server and by RLS.

## Tasks
- Add permission helpers for group membership and leader checks.
- Ensure server actions validate current user role.
- Ensure assigned-member-only transitions are enforced server-side.
- Add guard checks for task/project/group relationship consistency.
- Review task RLS policies.

## Acceptance Criteria
- UI-only role checks are not relied on for security.
- Member cannot mutate another member's assigned task.
- Leader-only task actions reject members.
- RLS still protects direct client access.

## Notes
- This issue is critical before evidence/review features.
'@
  },
  @{
    Title = "Implement evidence upload and external evidence link support"
    Milestone = "Sprint 4 - Evidence and Review"
    Labels = @("sprint:4", "priority:high", "type:feature", "type:security", "area:evidences", "area:supabase")
    Body = @'
## Objective
Allow assigned members to attach proof of work to tasks.

## Tasks
- Build evidence upload form.
- Support PDF, PNG, JPG, and DOCX file upload.
- Support external links for Google Drive, GitHub, Figma, and draw.io.
- Save metadata to `task_evidences`.
- Store files in `task-evidences/group-id/project-id/task-id/filename`.
- Enforce max 3 files per task and max 5 MB per file.

## Acceptance Criteria
- Assigned member can add evidence to their task.
- Evidence appears on task detail.
- User outside group cannot access evidence metadata or file.
- Invalid file type and oversized file are rejected.

## Notes
- File access must not be public without access control.
'@
  },
  @{
    Title = "Implement submit review flow with evidence requirement"
    Milestone = "Sprint 4 - Evidence and Review"
    Labels = @("sprint:4", "priority:high", "type:feature", "type:security", "area:reviews", "area:evidences")
    Body = @'
## Objective
Allow assigned members to submit work for leader review only after evidence exists.

## Tasks
- Add Submit Review action on task detail.
- Check task belongs to current assigned member.
- Check task has at least one evidence record.
- Update task status to `submit_review`.
- Create activity log.

## Acceptance Criteria
- Task cannot be submitted without evidence.
- Only assigned member can submit the task.
- Status becomes `submit_review`.
- Leader can see the task in review list.

## Notes
- Member still cannot set task to `done`.
'@
  },
  @{
    Title = "Implement leader review page with approve and revision actions"
    Milestone = "Sprint 4 - Evidence and Review"
    Labels = @("sprint:4", "priority:high", "type:feature", "type:security", "area:reviews")
    Body = @'
## Objective
Allow group leaders to validate submitted tasks.

## Tasks
- Build `/groups/[groupId]/review`.
- List tasks with status `submit_review`.
- Show evidence summary and link to task detail.
- Implement Approve action.
- Implement Revision action with required note.
- Insert `task_reviews` records.
- Update task status and approval fields.
- Create activity log.

## Acceptance Criteria
- Only leader can approve or request revision.
- Revision note is required.
- Approved task becomes `approved` or `done` based on implementation decision.
- Revised task becomes `revision`.
- Approved task is eligible for contribution calculation.

## Notes
- Keep review UI concise because leader review can become a bottleneck.
'@
  },
  @{
    Title = "Implement task reassign flow with required reason"
    Milestone = "Sprint 4 - Evidence and Review"
    Labels = @("sprint:4", "priority:high", "type:feature", "type:security", "area:reviews", "area:tasks")
    Body = @'
## Objective
Allow leaders to move a task to another member when the original assignee is inactive or work is transferred.

## Tasks
- Add Reassign action for leader on task detail.
- Require new assignee to be a group member.
- Require reassignment reason.
- Insert `task_reassignments`.
- Update `tasks.assigned_to`.
- Create activity log.

## Acceptance Criteria
- Only leader can reassign task.
- Reason is required.
- New assignee receives responsibility for the task.
- Old assignee does not receive contribution points if they did not complete the task.
- Reassignment history is visible in activity or task detail.

## Notes
- Reassign does not create payment, grading, or lecturer workflow.
'@
  },
  @{
    Title = "Implement activity log creation and activity timeline page"
    Milestone = "Sprint 4 - Evidence and Review"
    Labels = @("sprint:4", "priority:high", "type:feature", "area:activity")
    Body = @'
## Objective
Make important work history transparent for group members.

## Tasks
- Create reusable activity log server helper.
- Log task created, assigned, status changed, evidence uploaded, submit review, revision, approve, reassign, comment added, and report exported.
- Build `/groups/[groupId]/activity`.
- Show timeline with user, action, time, and description.

## Acceptance Criteria
- Important actions create activity records.
- Group members can view only their group activity.
- User outside group cannot view activity.
- Activity records cannot be edited by normal users.

## Notes
- Activity log is central to CircleTask's evidence-based workflow.
'@
  },
  @{
    Title = "Implement contribution scoring calculation"
    Milestone = "Sprint 5 - Contribution Report and Release"
    Labels = @("sprint:5", "priority:high", "type:feature", "area:contributions")
    Body = @'
## Objective
Calculate member contribution from approved or done tasks only.

## Tasks
- Implement contribution query/calculation helper.
- Include task weight.
- Apply deadline penalty: 10 percent for 1-2 days late, 20 percent for more than 2 days late.
- Apply 10 percent penalty if revisions are more than 2 times.
- Ensure reassigned task counts for the final assignee who completes it.

## Acceptance Criteria
- Only `approved` or `done` tasks are counted.
- Contribution percentage is calculated from member score / total score.
- Detail source points can be shown per task.
- Unapproved and revision tasks do not count.

## Notes
- Keep formula simple for MVP.
'@
  },
  @{
    Title = "Implement contribution page and dashboard progress metrics"
    Milestone = "Sprint 5 - Contribution Report and Release"
    Labels = @("sprint:5", "priority:high", "type:feature", "type:ui", "area:contributions", "area:app")
    Body = @'
## Objective
Show group progress and contribution summary clearly to leaders and members.

## Tasks
- Build `/groups/[groupId]/contribution`.
- Show contribution table with members, scores, and percentages.
- Show task detail source for contribution.
- Add dashboard metrics: total project, total task, done task, overdue task, pending review, nearest deadline.
- Add empty state when no approved task exists.

## Acceptance Criteria
- Leader can see all member contribution.
- Member can see contribution context without accessing other group data outside membership.
- Dashboard metrics match latest task data.
- Data is protected by RLS and server-side permissions.

## Notes
- Do not add academic grading system.
'@
  },
  @{
    Title = "Implement report preview data aggregation"
    Milestone = "Sprint 5 - Contribution Report and Release"
    Labels = @("sprint:5", "priority:high", "type:feature", "area:reports")
    Body = @'
## Objective
Prepare the report preview data needed before exporting the contribution PDF.

## Tasks
- Build `/groups/[groupId]/report`.
- Aggregate group, project, members, tasks, evidence, reassign history, activity summary, and contribution score.
- Show preview UI for leader.
- Restrict report page to leader.

## Acceptance Criteria
- Leader can preview report data.
- Preview includes all MVP report sections.
- Non-leader members cannot export report.
- User outside group cannot access report data.

## Notes
- Keep report content concise to avoid heavy PDF rendering.
'@
  },
  @{
    Title = "Implement React PDF contribution report export"
    Milestone = "Sprint 5 - Contribution Report and Release"
    Labels = @("sprint:5", "priority:high", "type:feature", "area:reports")
    Body = @'
## Objective
Allow leaders to download a contribution report PDF that can be used as an assignment attachment.

## Tasks
- Build `ContributionReportPDF` with React PDF.
- Include group name, project list, member list, tasks, statuses, evidence references, reassignment history, activity summary, contribution score, and conclusion.
- Add download/export action.
- Create activity log when report is exported.

## Acceptance Criteria
- Leader can download PDF.
- PDF renders readable contribution information.
- Report export creates activity log.
- PDF does not include unauthorized data.

## Notes
- Use React PDF for MVP, not Puppeteer unless explicitly changed later.
'@
  },
  @{
    Title = "Final testing, security review, and Vercel deployment"
    Milestone = "Sprint 5 - Contribution Report and Release"
    Labels = @("sprint:5", "priority:high", "type:testing", "type:deployment", "type:security", "area:release")
    Body = @'
## Objective
Verify the MVP end-to-end and deploy it safely.

## Tasks
- Test register/login/logout.
- Test create group, join group, create project, create task.
- Test member status update, evidence upload, submit review.
- Test leader approve, revision, reassign.
- Test contribution calculation and PDF export.
- Review RLS and storage policies.
- Configure Vercel environment variables.
- Deploy to Vercel and smoke test production.

## Acceptance Criteria
- MVP success metrics in `docs/PRD.md` are satisfied.
- User outside group cannot access private data.
- Service role key is not exposed to client.
- Production deployment works with Supabase.

## Notes
- This issue closes the MVP release, not post-MVP enhancements.
'@
  }
)

foreach ($issue in $issues) {
  $arguments = @(
    "issue", "create",
    "--repo", $Repo,
    "--title", $issue.Title,
    "--body", $issue.Body,
    "--milestone", $issue.Milestone
  )

  foreach ($label in $issue.Labels) {
    $arguments += @("--label", $label)
  }

  $issueUrl = Invoke-Gh -Arguments $arguments

  if ($issueUrl) {
    Write-Host "Created: $issueUrl"
    Add-IssueToProject -IssueUrl $issueUrl
  }
}

Write-Host "Done. Created labels, milestones, and MVP issues for $Repo."

if ($ProjectOwner -eq "" -or $ProjectNumber -le 0) {
  Write-Host "Project add skipped. Pass -ProjectOwner and -ProjectNumber to add created issues to a GitHub Project v2."
}
