-- ============================================================
-- ADHII JARVIS - ROW LEVEL SECURITY (RLS) POLICIES
-- Project Identifier: adhii_jarvis
-- Ensure complete user data isolation across all tables
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- CONVERSATIONS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
CREATE POLICY "Users can create own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
    ON public.conversations FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;
CREATE POLICY "Users can delete own conversations"
    ON public.conversations FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- MESSAGES POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
CREATE POLICY "Users can insert own messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- MEMORIES POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own memories" ON public.memories;
CREATE POLICY "Users can view own memories"
    ON public.memories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own memories" ON public.memories;
CREATE POLICY "Users can create own memories"
    ON public.memories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memories" ON public.memories;
CREATE POLICY "Users can update own memories"
    ON public.memories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON public.memories;
CREATE POLICY "Users can delete own memories"
    ON public.memories FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- DOCUMENTS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upload own documents" ON public.documents;
CREATE POLICY "Users can upload own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- DOCUMENT CHUNKS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own document chunks" ON public.document_chunks;
CREATE POLICY "Users can view own document chunks"
    ON public.document_chunks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own document chunks" ON public.document_chunks;
CREATE POLICY "Users can insert own document chunks"
    ON public.document_chunks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own document chunks" ON public.document_chunks;
CREATE POLICY "Users can delete own document chunks"
    ON public.document_chunks FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- NOTES POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
CREATE POLICY "Users can view own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own notes" ON public.notes;
CREATE POLICY "Users can create own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- TASKS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
CREATE POLICY "Users can create own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- REMINDERS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own reminders" ON public.reminders;
CREATE POLICY "Users can view own reminders"
    ON public.reminders FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own reminders" ON public.reminders;
CREATE POLICY "Users can create own reminders"
    ON public.reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminders" ON public.reminders;
CREATE POLICY "Users can update own reminders"
    ON public.reminders FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reminders" ON public.reminders;
CREATE POLICY "Users can delete own reminders"
    ON public.reminders FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- TOOL ACTIVITY POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own tool activity" ON public.tool_activity;
CREATE POLICY "Users can view own tool activity"
    ON public.tool_activity FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log own tool activity" ON public.tool_activity;
CREATE POLICY "Users can log own tool activity"
    ON public.tool_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tool activity" ON public.tool_activity;
CREATE POLICY "Users can update own tool activity"
    ON public.tool_activity FOR UPDATE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);
