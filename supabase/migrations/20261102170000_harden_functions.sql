-- Security advisor fixes (applied to the Supabase project on 2026-11-02).
-- 1) Fixed search_path for the updated_at trigger function.
alter function public.touch_updated_at() set search_path = public;
-- 2) handle_new_user is only meant to run as a trigger, never via the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- Note: public.is_admin() stays executable on purpose: RLS policies call it as the
-- requesting user. It only reveals whether the caller is an admin.
