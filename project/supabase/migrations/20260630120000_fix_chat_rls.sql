-- Fix missing RLS policies for chat_threads to allow users to create and update threads
DROP POLICY IF EXISTS "Users can insert chat threads" ON chat_threads;
CREATE POLICY "Users can insert chat threads" ON chat_threads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = athlete_id OR auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Users can update chat threads" ON chat_threads;
CREATE POLICY "Users can update chat threads" ON chat_threads
    FOR UPDATE TO authenticated
    USING (auth.uid() = athlete_id OR auth.uid() = mentor_id)
    WITH CHECK (auth.uid() = athlete_id OR auth.uid() = mentor_id);
