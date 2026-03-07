-- ============================================================
-- Migration: Roles, Permissions & Stats
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Add role & subject to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'teacher', 'admin'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subject text; -- teacher branch / subject

-- 2. Extend votes to support notes
ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_target_type_check;

ALTER TABLE public.votes
  ADD CONSTRAINT votes_target_type_check
    CHECK (target_type IN ('question', 'answer', 'note'));

-- 3. Add view_count to notes (if not exists)
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- 4. RPC: increment note view count
CREATE OR REPLACE FUNCTION public.increment_note_view_count(note_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.notes SET view_count = view_count + 1 WHERE id = note_id;
END;
$$;

-- 5. Helper: get user role by id
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- 6. Helper: get user subject (teacher branch)
CREATE OR REPLACE FUNCTION public.get_user_subject(user_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT subject FROM public.profiles WHERE id = user_id;
$$;

-- ============================================================
-- 7. Updated RLS Policies for role-based access
-- ============================================================

-- ─── QUESTIONS ────────────────────────────────────────────

-- Drop old update/delete policies
DROP POLICY IF EXISTS "Authors can update own questions" ON public.questions;
DROP POLICY IF EXISTS "Authors can delete own questions" ON public.questions;

-- Update: owner OR admin OR teacher with matching subject
CREATE POLICY "Role-based update questions" ON public.questions FOR UPDATE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
  OR (
    public.get_user_role(auth.uid()) = 'teacher'
    AND subject = public.get_user_subject(auth.uid())
  )
);

-- Delete: owner OR admin OR teacher with matching subject
CREATE POLICY "Role-based delete questions" ON public.questions FOR DELETE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
  OR (
    public.get_user_role(auth.uid()) = 'teacher'
    AND subject = public.get_user_subject(auth.uid())
  )
);

-- ─── NOTES ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authors can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Authors can delete own notes" ON public.notes;

CREATE POLICY "Role-based update notes" ON public.notes FOR UPDATE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
  OR (
    public.get_user_role(auth.uid()) = 'teacher'
    AND subject = public.get_user_subject(auth.uid())
  )
);

CREATE POLICY "Role-based delete notes" ON public.notes FOR DELETE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
  OR (
    public.get_user_role(auth.uid()) = 'teacher'
    AND subject = public.get_user_subject(auth.uid())
  )
);

-- ─── ANSWERS ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Authors can update own answers" ON public.answers;
DROP POLICY IF EXISTS "Authors can delete own answers" ON public.answers;

CREATE POLICY "Role-based update answers" ON public.answers FOR UPDATE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Role-based delete answers" ON public.answers FOR DELETE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
);

-- ─── ANSWER REPLIES ───────────────────────────────────────

DROP POLICY IF EXISTS "Authors can delete own replies" ON public.answer_replies;

CREATE POLICY "Role-based delete replies" ON public.answer_replies FOR DELETE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
);

-- ─── NOTE COMMENTS ────────────────────────────────────────

DROP POLICY IF EXISTS "Authors can delete own note comments" ON public.note_comments;

CREATE POLICY "Role-based delete note comments" ON public.note_comments FOR DELETE USING (
  auth.uid() = author_id
  OR public.get_user_role(auth.uid()) = 'admin'
  OR (
    public.get_user_role(auth.uid()) = 'teacher'
    AND (SELECT subject FROM public.notes WHERE id = note_id) = public.get_user_subject(auth.uid())
  )
);

-- ============================================================
-- Done! Now update a user role to test:
-- UPDATE profiles SET role='admin' WHERE username='umutarda33';
-- UPDATE profiles SET role='teacher', subject='matematik' WHERE username='some_teacher';
-- ============================================================
