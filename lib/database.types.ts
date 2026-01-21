export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          email: string
          section: '01' | '02'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          section: '01' | '02'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          section?: '01' | '02'
          created_at?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          id: string
          submission_id: string
          article_engagement: number
          evidence_reasoning: number
          critical_thinking: number
          clinical_connection: number
          reflection_pass: boolean
          total_score: number
          grader_notes: string | null
          graded_by: string
          graded_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          article_engagement: number
          evidence_reasoning: number
          critical_thinking: number
          clinical_connection: number
          reflection_pass: boolean
          grader_notes?: string | null
          graded_by: string
          graded_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          article_engagement?: number
          evidence_reasoning?: number
          critical_thinking?: number
          clinical_connection?: number
          reflection_pass?: boolean
          grader_notes?: string | null
          graded_by?: string
          graded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_submission_id_fkey"
            columns: ["submission_id"]
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          student_name: string
          student_email: string
          week_number: number
          transcript: Json
          reflection: string | null
          started_at: string
          submitted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_name: string
          student_email: string
          week_number: number
          transcript?: Json
          reflection?: string | null
          started_at?: string
          submitted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          student_email?: string
          week_number?: number
          transcript?: Json
          reflection?: string | null
          started_at?: string
          submitted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          id: string
          conversation_id: string
          score: number | null
          flagged: boolean
          flag_reason: string | null
          reviewed: boolean
          reviewed_at: string | null
          reviewer_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          score?: number | null
          flagged?: boolean
          flag_reason?: string | null
          reviewed?: boolean
          reviewed_at?: string | null
          reviewer_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          score?: number | null
          flagged?: boolean
          flag_reason?: string | null
          reviewed?: boolean
          reviewed_at?: string | null
          reviewer_notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      crisis_incidents: {
        Row: {
          id: string
          incident_type: string
          detected_at: string
        }
        Insert: {
          id?: string
          incident_type: string
          detected_at?: string
        }
        Update: {
          id?: string
          incident_type?: string
          detected_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      submission_details: {
        Row: {
          conversation_id: string
          student_name: string
          student_email: string
          week_number: number
          transcript: Json
          reflection: string | null
          started_at: string
          submitted_at: string
          submission_id: string
          score: number | null
          flagged: boolean
          flag_reason: string | null
          paste_attempts: number | null
          suspected_ai_responses: number | null
          reviewed: boolean
          reviewed_at: string | null
          reviewer_notes: string | null
          message_count: number
          duration_minutes: number
        }
        Relationships: []
      }
      submission_details_v2: {
        Row: {
          conversation_id: string
          student_name: string
          student_email: string
          week_number: number
          transcript: Json
          reflection: string | null
          started_at: string
          submitted_at: string
          submission_id: string
          legacy_score: number | null
          flagged: boolean
          flag_reason: string | null
          reviewed: boolean
          reviewed_at: string | null
          legacy_notes: string | null
          grade_id: string | null
          article_engagement: number | null
          evidence_reasoning: number | null
          critical_thinking: number | null
          clinical_connection: number | null
          reflection_pass: boolean | null
          total_score: number | null
          grader_notes: string | null
          graded_by: string | null
          graded_at: string | null
          student_id: string | null
          section: string | null
          message_count: number
          duration_minutes: number
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          student_id: string
          student_name: string
          student_email: string
          section: string
          week_number: number
          submission_id: string | null
          total_score: number | null
          graded_at: string | null
          status: 'not_submitted' | 'ungraded' | 'graded'
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
export type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']
export type SubmissionDetail = Database['public']['Views']['submission_details']['Row'] & {
  transcript: Message[]
}

// New types for enhanced instructor dashboard
export type Student = Database['public']['Tables']['students']['Row']
export type StudentInsert = Database['public']['Tables']['students']['Insert']
export type StudentUpdate = Database['public']['Tables']['students']['Update']
export type Grade = Database['public']['Tables']['grades']['Row']
export type GradeInsert = Database['public']['Tables']['grades']['Insert']
export type GradeUpdate = Database['public']['Tables']['grades']['Update']
export type SubmissionDetailV2 = Database['public']['Views']['submission_details_v2']['Row'] & {
  transcript: Message[]
}
export type StudentProgress = Database['public']['Views']['student_progress']['Row']
