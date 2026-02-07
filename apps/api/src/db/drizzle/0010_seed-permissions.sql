INSERT INTO "permissions" ("name", "level") VALUES 
  ('owner', 4),
  ('admin', 3),
  ('maintainer', 2),
  ('guest', 1)
ON CONFLICT (name) DO NOTHING;