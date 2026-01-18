-- SLHS 303 Instructor Dashboard Schema
-- Run this in Supabase SQL Editor to set up the database

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('01', '02')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);

-- ============================================
-- GRADES TABLE (Enhanced rubric)
-- ============================================
-- This replaces the simple score field in submissions with detailed rubric
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  article_engagement INTEGER NOT NULL CHECK (article_engagement BETWEEN 0 AND 2),
  evidence_reasoning INTEGER NOT NULL CHECK (evidence_reasoning BETWEEN 0 AND 2),
  critical_thinking INTEGER NOT NULL CHECK (critical_thinking BETWEEN 0 AND 2),
  clinical_connection INTEGER NOT NULL CHECK (clinical_connection BETWEEN 0 AND 2),
  reflection_pass BOOLEAN NOT NULL DEFAULT false,
  total_score INTEGER GENERATED ALWAYS AS (
    article_engagement + evidence_reasoning + critical_thinking + clinical_connection
  ) STORED,
  grader_notes TEXT,
  graded_by TEXT NOT NULL,
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_grades_submission_id ON grades(submission_id);

-- ============================================
-- ADD STUDENT_ID TO CONVERSATIONS (if not exists)
-- ============================================
-- Link conversations to the students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN student_id UUID REFERENCES students(id);
    CREATE INDEX idx_conversations_student_id ON conversations(student_id);
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Service role only students" ON students;
DROP POLICY IF EXISTS "Service role only grades" ON grades;

-- Create policies - only service role can access
CREATE POLICY "Service role only students" ON students
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only grades" ON grades
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ENHANCED SUBMISSION DETAILS VIEW
-- ============================================
DROP VIEW IF EXISTS submission_details_v2;

CREATE VIEW submission_details_v2 AS
SELECT
  c.id as conversation_id,
  c.student_name,
  c.student_email,
  c.week_number,
  c.transcript,
  c.reflection,
  c.started_at,
  c.submitted_at,
  s.id as submission_id,
  s.score as legacy_score,
  s.flagged,
  s.flag_reason,
  s.reviewed,
  s.reviewed_at,
  s.reviewer_notes as legacy_notes,
  g.id as grade_id,
  g.article_engagement,
  g.evidence_reasoning,
  g.critical_thinking,
  g.clinical_connection,
  g.reflection_pass,
  g.total_score,
  g.grader_notes,
  g.graded_by,
  g.graded_at,
  st.id as student_id,
  st.section,
  jsonb_array_length(c.transcript::jsonb) as message_count,
  EXTRACT(EPOCH FROM (c.submitted_at - c.started_at)) / 60 as duration_minutes
FROM conversations c
JOIN submissions s ON c.id = s.conversation_id
LEFT JOIN grades g ON s.id = g.submission_id
LEFT JOIN students st ON c.student_email = st.email
WHERE c.submitted_at IS NOT NULL;

-- ============================================
-- STUDENT PROGRESS VIEW
-- ============================================
DROP VIEW IF EXISTS student_progress;

CREATE VIEW student_progress AS
SELECT
  st.id as student_id,
  st.name as student_name,
  st.email as student_email,
  st.section,
  c.week_number,
  s.id as submission_id,
  g.total_score,
  g.graded_at,
  CASE
    WHEN s.id IS NULL THEN 'not_submitted'
    WHEN g.id IS NULL THEN 'ungraded'
    ELSE 'graded'
  END as status
FROM students st
CROSS JOIN generate_series(2, 15) as week_number  -- Weeks 2-15 have assignments
LEFT JOIN conversations c ON st.email = c.student_email AND c.week_number = week_number AND c.submitted_at IS NOT NULL
LEFT JOIN submissions s ON c.id = s.conversation_id
LEFT JOIN grades g ON s.id = g.submission_id;

-- ============================================
-- HELPER FUNCTION: Get submission counts by status
-- ============================================
CREATE OR REPLACE FUNCTION get_submission_stats()
RETURNS TABLE(
  total_submissions BIGINT,
  graded_count BIGINT,
  ungraded_count BIGINT,
  flagged_count BIGINT,
  this_week_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT s.id) as total_submissions,
    COUNT(DISTINCT g.submission_id) as graded_count,
    COUNT(DISTINCT s.id) - COUNT(DISTINCT g.submission_id) as ungraded_count,
    COUNT(DISTINCT CASE WHEN s.flagged THEN s.id END) as flagged_count,
    COUNT(DISTINCT CASE WHEN c.submitted_at >= NOW() - INTERVAL '7 days' THEN s.id END) as this_week_count
  FROM submissions s
  JOIN conversations c ON s.conversation_id = c.id
  LEFT JOIN grades g ON s.id = g.submission_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Get student roster with stats
-- ============================================
CREATE OR REPLACE FUNCTION get_roster_with_stats()
RETURNS TABLE(
  student_id UUID,
  name TEXT,
  email TEXT,
  section TEXT,
  submission_count BIGINT,
  graded_count BIGINT,
  avg_score NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.id as student_id,
    st.name,
    st.email,
    st.section,
    COUNT(DISTINCT s.id) as submission_count,
    COUNT(DISTINCT g.id) as graded_count,
    ROUND(AVG(g.total_score)::numeric, 1) as avg_score,
    st.created_at
  FROM students st
  LEFT JOIN conversations c ON st.email = c.student_email AND c.submitted_at IS NOT NULL
  LEFT JOIN submissions s ON c.id = s.conversation_id
  LEFT JOIN grades g ON s.id = g.submission_id
  GROUP BY st.id, st.name, st.email, st.section, st.created_at
  ORDER BY st.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKET FOR PDF SUBMISSIONS
-- ============================================

-- Create the bucket for PDF submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-submissions',
  'pdf-submissions',
  false,  -- Private bucket (not publicly accessible)
  10485760,  -- 10MB max file size
  ARRAY['application/pdf']  -- Only allow PDF files
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR PDF BUCKET
-- ============================================

-- Allow service role to do everything (for instructor access)
CREATE POLICY "Service role full access to pdf-submissions"
ON storage.objects
FOR ALL
USING (bucket_id = 'pdf-submissions' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'pdf-submissions' AND auth.role() = 'service_role');

-- Allow authenticated users to upload PDFs (path: email/week/filename.pdf)
CREATE POLICY "Users can upload their own PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pdf-submissions'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to read their own PDFs
CREATE POLICY "Users can read their own PDFs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'pdf-submissions'
  AND auth.role() = 'authenticated'
);
