-- Drop the obsolete caldav_uid trigger that references a non-existent column
DROP TRIGGER IF EXISTS ensure_caldav_uid ON public.events;

-- Optionally drop the function too since it's no longer needed
DROP FUNCTION IF EXISTS public.generate_caldav_uid();