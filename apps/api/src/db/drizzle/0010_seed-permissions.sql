INSERT INTO "permissions" ("id", "name", "level") VALUES 
  (1, 'guest', 1),
  (2, 'maintainer', 2),
  (3, 'admin', 3),
  (4, 'owner', 4)
ON CONFLICT (name) DO NOTHING;