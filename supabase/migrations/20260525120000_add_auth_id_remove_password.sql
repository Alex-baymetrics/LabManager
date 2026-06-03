ALTER TABLE labmanager.users
  ADD COLUMN auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE labmanager.users DROP COLUMN password;
