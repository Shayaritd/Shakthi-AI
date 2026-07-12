-- Function to notify a mentor when a new mentorship request is created
CREATE OR REPLACE FUNCTION public.notify_mentorship_request()
RETURNS TRIGGER AS $$
DECLARE
  athlete_name text;
BEGIN
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mentorship request creation
DROP TRIGGER IF EXISTS on_mentorship_request_created ON public.mentorship_requests;
CREATE TRIGGER on_mentorship_request_created
AFTER INSERT ON public.mentorship_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_mentorship_request();

-- Function to notify an athlete when a mentorship request is approved
CREATE OR REPLACE FUNCTION public.notify_mentorship_approval()
RETURNS TRIGGER AS $$
DECLARE
  mentor_name text;
BEGIN
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mentorship request approval
DROP TRIGGER IF EXISTS on_mentorship_request_approved ON public.mentorship_requests;
CREATE TRIGGER on_mentorship_request_approved
AFTER UPDATE ON public.mentorship_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_mentorship_approval();

-- Function to notify a user when their profile gets verified
CREATE OR REPLACE FUNCTION public.notify_profile_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified = true AND OLD.verified = false THEN
    INSERT INTO public.notifications (user_id, type, title, message, read, action_url)
    VALUES (
      NEW.id,
      'VERIFICATION',
      'Profile Verified!',
      'Your profile has been successfully verified by our safety team. You are now a verified member of SHAKTHI.',
      false,
      '/settings'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile verification
DROP TRIGGER IF EXISTS on_profile_verified ON public.profiles;
CREATE TRIGGER on_profile_verified
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_profile_verification();
