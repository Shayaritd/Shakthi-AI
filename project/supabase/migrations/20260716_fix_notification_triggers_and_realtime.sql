-- 1. Enable Realtime for notifications, chat_threads, chat_messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Enable REPLICA IDENTITY FULL for the tables
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_threads REPLICA IDENTITY FULL;

-- Add tables to publication safely
DO $$
BEGIN
  -- For public.notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  -- For public.chat_messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;

  -- For public.chat_threads
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
  END IF;
END $$;

-- 2. Redefine trigger functions
CREATE OR REPLACE FUNCTION public.notify_mentorship_request()
RETURNS TRIGGER AS $$
DECLARE
  athlete_name text;
  mentor_name text;
BEGIN
  SELECT full_name INTO athlete_name FROM public.profiles WHERE id = NEW.athlete_id;
  SELECT full_name INTO mentor_name FROM public.profiles WHERE id = NEW.mentor_id;

  IF NEW.status = 'PENDING_GUARDIAN' AND NEW.guardian_id IS NOT NULL THEN
    -- Notify Guardian
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.guardian_id,
      'MENTORSHIP',
      'Mentorship Request Needs Your Approval',
      COALESCE(athlete_name, 'An Athlete') || ' has requested mentorship from ' || COALESCE(mentor_name, 'a Coach') || '. Please review and approve.',
      false,
      '/dashboard'
    );
    -- Notify Athlete
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.athlete_id,
      'MENTORSHIP',
      'Mentorship Request Sent',
      'Your request to ' || COALESCE(mentor_name, 'the Coach') || ' has been sent and is awaiting guardian approval.',
      false,
      '/dashboard'
    );
  ELSIF NEW.status = 'PENDING' THEN
    -- Notify Mentor
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.mentor_id,
      'MENTORSHIP',
      'New Mentorship Request',
      COALESCE(athlete_name, 'An Athlete') || ' has requested you as a mentor.',
      false,
      '/dashboard/mentor'
    );
    -- Notify Athlete
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.athlete_id,
      'MENTORSHIP',
      'Mentorship Request Sent',
      'Your request to ' || COALESCE(mentor_name, 'the Coach') || ' has been sent!',
      false,
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.notify_mentorship_approval()
RETURNS TRIGGER AS $$
DECLARE
  mentor_name text;
  athlete_name text;
BEGIN
  -- When Guardian approves (PENDING_GUARDIAN -> PENDING)
  IF NEW.status = 'PENDING' AND OLD.status = 'PENDING_GUARDIAN' THEN
    SELECT full_name INTO athlete_name FROM public.profiles WHERE id = NEW.athlete_id;
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.mentor_id,
      'MENTORSHIP',
      'New Mentorship Request',
      COALESCE(athlete_name, 'An Athlete') || ' has requested you as a mentor.',
      false,
      '/dashboard/mentor'
    );
    -- Notify Athlete
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.athlete_id,
      'MENTORSHIP',
      'Guardian Approved Request',
      'Your guardian has approved your mentorship request to ' || (SELECT full_name FROM public.profiles WHERE id = NEW.mentor_id) || '. It is now pending mentor approval.',
      false,
      '/dashboard'
    );
  END IF;

  -- When Mentor approves (PENDING -> APPROVED)
  IF NEW.status = 'APPROVED' AND OLD.status = 'PENDING' THEN
    SELECT full_name INTO mentor_name FROM public.profiles WHERE id = NEW.mentor_id;
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.athlete_id,
      'MENTORSHIP',
      'Mentorship Request Accepted',
      COALESCE(mentor_name, 'Your mentor') || ' has approved your mentorship request!',
      false,
      '/chat'
    );
  END IF;

  -- When Mentor declines
  IF NEW.status = 'REJECTED' AND OLD.status = 'PENDING' THEN
    SELECT full_name INTO mentor_name FROM public.profiles WHERE id = NEW.mentor_id;
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.athlete_id,
      'MENTORSHIP',
      'Mentorship Request Declined',
      COALESCE(mentor_name, 'Your mentor') || ' has declined your mentorship request.',
      false,
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update RLS policies to allow guardians to view chat threads & messages
DROP POLICY IF EXISTS "select_chat_threads" ON public.chat_threads;
CREATE POLICY "select_chat_threads" ON public.chat_threads FOR SELECT TO authenticated
USING (
  auth.uid() = athlete_id 
  OR auth.uid() = mentor_id
  OR EXISTS (
    SELECT 1 FROM public.athlete_profiles 
    WHERE user_id = chat_threads.athlete_id 
    AND guardian_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "select_chat_messages" ON public.chat_messages;
CREATE POLICY "select_chat_messages" ON public.chat_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_threads
    WHERE chat_threads.id = chat_messages.thread_id
    AND (
      chat_threads.athlete_id = auth.uid()
      OR chat_threads.mentor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.athlete_profiles
        WHERE user_id = chat_threads.athlete_id
        AND guardian_user_id = auth.uid()
      )
    )
  )
);
