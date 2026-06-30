import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ReportPreviewData } from "@/features/reports/types";

type ContributionReportPDFProps = {
  data: ReportPreviewData;
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 4,
  },
  headerRow: {
    backgroundColor: "#f9fafb",
    fontWeight: 700,
  },
  colLarge: {
    flex: 2,
    paddingRight: 6,
  },
  col: {
    flex: 1,
    paddingRight: 6,
  },
  muted: {
    color: "#6b7280",
  },
  small: {
    fontSize: 8,
    color: "#6b7280",
  },
});

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}

function EmptyText({ children }: { children: string }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function ContributionReportPDF({ data }: ContributionReportPDFProps) {
  const approvedTasks = data.tasks.filter((task) => task.status === "approved" || task.status === "done");

  return (
    <Document
      title={`Laporan Kontribusi - ${data.group.name}`}
      author="CircleTask"
      subject="Laporan kontribusi kelompok"
      creator="CircleTask"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.section}>
          <Text style={styles.title}>Laporan Kontribusi</Text>
          <Text style={styles.subtitle}>
            {data.group.name} - dibuat dari activity, task, bukti, review, dan kontribusi CircleTask.
          </Text>
          <Text>Deskripsi kelompok: {data.group.description ?? "-"}</Text>
          <Text>Kode join: {data.group.joinCode}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.col}>Anggota</Text>
            <Text style={styles.col}>Project</Text>
            <Text style={styles.col}>Task</Text>
            <Text style={styles.col}>Approved/Done</Text>
            <Text style={styles.col}>Total Skor</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col}>{data.members.length}</Text>
            <Text style={styles.col}>{data.projects.length}</Text>
            <Text style={styles.col}>{data.tasks.length}</Text>
            <Text style={styles.col}>{approvedTasks.length}</Text>
            <Text style={styles.col}>{data.contribution.totalScore.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontribusi Anggota</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.colLarge}>Nama</Text>
            <Text style={styles.col}>Task</Text>
            <Text style={styles.col}>Skor</Text>
            <Text style={styles.col}>Persentase</Text>
          </View>
          {data.contribution.members.length > 0 ? (
            data.contribution.members.map((member) => (
              <View key={member.userId} style={styles.row}>
                <Text style={styles.colLarge}>{member.fullName}</Text>
                <Text style={styles.col}>{member.taskCount}</Text>
                <Text style={styles.col}>{member.finalScore.toFixed(2)}</Text>
                <Text style={styles.col}>{formatPercentage(member.percentage)}</Text>
              </View>
            ))
          ) : (
            <EmptyText>Belum ada task approved atau done.</EmptyText>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.colLarge}>Judul</Text>
            <Text style={styles.col}>Deadline</Text>
            <Text style={styles.col}>Progress</Text>
          </View>
          {data.projects.length > 0 ? (
            data.projects.map((project) => (
              <View key={project.id} style={styles.row}>
                <Text style={styles.colLarge}>{project.title}</Text>
                <Text style={styles.col}>{formatDate(project.deadline)}</Text>
                <Text style={styles.col}>{project.progress}%</Text>
              </View>
            ))
          ) : (
            <EmptyText>Belum ada project.</EmptyText>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task dan Bukti</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.colLarge}>Task</Text>
            <Text style={styles.col}>Status</Text>
            <Text style={styles.col}>Deadline</Text>
            <Text style={styles.col}>Bukti</Text>
          </View>
          {data.tasks.length > 0 ? (
            data.tasks.map((task) => {
              const evidenceCount = data.evidences.filter((evidence) => evidence.taskId === task.id).length;

              return (
                <View key={task.id} style={styles.row}>
                  <Text style={styles.colLarge}>{task.title}</Text>
                  <Text style={styles.col}>{task.status}</Text>
                  <Text style={styles.col}>{formatDate(task.deadline)}</Text>
                  <Text style={styles.col}>{evidenceCount}</Text>
                </View>
              );
            })
          ) : (
            <EmptyText>Belum ada task.</EmptyText>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riwayat Reassign</Text>
          {data.reassignments.length > 0 ? (
            data.reassignments.map((reassignment) => (
              <Text key={reassignment.id} style={styles.small}>
                {formatDate(reassignment.createdAt)} - Task {reassignment.taskId}: {reassignment.reason}
              </Text>
            ))
          ) : (
            <EmptyText>Belum ada reassign task.</EmptyText>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Log Ringkas</Text>
          {data.activities.length > 0 ? (
            data.activities.slice(0, 20).map((activity) => (
              <Text key={activity.id} style={styles.small}>
                {formatDate(activity.createdAt)} - {activity.userName}: {activity.description ?? activity.action}
              </Text>
            ))
          ) : (
            <EmptyText>Belum ada activity log.</EmptyText>
          )}
        </View>
      </Page>
    </Document>
  );
}

