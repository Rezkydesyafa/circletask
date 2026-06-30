export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          join_code: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          join_code: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          join_code?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["group_role"];
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["group_role"];
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["group_role"];
          joined_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          group_id: string;
          title: string;
          description: string | null;
          deadline: string;
          status: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          title: string;
          description?: string | null;
          deadline: string;
          status?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          title?: string;
          description?: string | null;
          deadline?: string;
          status?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          group_id: string;
          title: string;
          description: string | null;
          assigned_to: string;
          status: Database["public"]["Enums"]["task_status"];
          priority: Database["public"]["Enums"]["task_priority"];
          weight: number;
          deadline: string;
          created_by: string;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          group_id: string;
          title: string;
          description?: string | null;
          assigned_to: string;
          status?: Database["public"]["Enums"]["task_status"];
          priority?: Database["public"]["Enums"]["task_priority"];
          weight: number;
          deadline: string;
          created_by: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          group_id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string;
          status?: Database["public"]["Enums"]["task_status"];
          priority?: Database["public"]["Enums"]["task_priority"];
          weight?: number;
          deadline?: string;
          created_by?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      task_evidences: {
        Row: {
          id: string;
          task_id: string;
          uploaded_by: string;
          evidence_type: Database["public"]["Enums"]["evidence_type"];
          file_path: string | null;
          external_url: string | null;
          file_name: string | null;
          file_size: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          uploaded_by: string;
          evidence_type: Database["public"]["Enums"]["evidence_type"];
          file_path?: string | null;
          external_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          uploaded_by?: string;
          evidence_type?: Database["public"]["Enums"]["evidence_type"];
          file_path?: string | null;
          external_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          comment?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      task_reviews: {
        Row: {
          id: string;
          task_id: string;
          reviewed_by: string;
          review_status: Database["public"]["Enums"]["review_status"];
          review_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          reviewed_by: string;
          review_status: Database["public"]["Enums"]["review_status"];
          review_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          reviewed_by?: string;
          review_status?: Database["public"]["Enums"]["review_status"];
          review_note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      task_reassignments: {
        Row: {
          id: string;
          task_id: string;
          from_user_id: string;
          to_user_id: string;
          reassigned_by: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          from_user_id: string;
          to_user_id: string;
          reassigned_by: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          from_user_id?: string;
          to_user_id?: string;
          reassigned_by?: string;
          reason?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          group_id: string;
          project_id: string | null;
          task_id: string | null;
          user_id: string;
          action: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          project_id?: string | null;
          task_id?: string | null;
          user_id: string;
          action: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          project_id?: string | null;
          task_id?: string | null;
          user_id?: string;
          action?: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_group_with_leader: {
        Args: {
          group_name: string;
          group_description?: string | null;
        };
        Returns: Json;
      };
      generate_group_join_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_group_leader: {
        Args: {
          target_group_id: string;
          target_user_id?: string;
        };
        Returns: boolean;
      };
      is_group_member: {
        Args: {
          target_group_id: string;
          target_user_id?: string;
        };
        Returns: boolean;
      };
      join_group_by_code: {
        Args: {
          target_join_code: string;
        };
        Returns: Json;
      };
      task_group_id: {
        Args: {
          target_task_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      evidence_type: "file" | "link";
      group_role: "leader" | "member";
      review_status: "approved" | "revision" | "rejected";
      task_priority: "low" | "medium" | "high";
      task_status: "todo" | "in_progress" | "submit_review" | "revision" | "approved" | "done";
    };
    CompositeTypes: Record<string, never>;
  };
};
