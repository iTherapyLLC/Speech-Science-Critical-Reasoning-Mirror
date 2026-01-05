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
          reviewed: boolean
          reviewed_at: string | null
          reviewer_notes: string | null
          message_count: number
          duration_minutes: number
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
