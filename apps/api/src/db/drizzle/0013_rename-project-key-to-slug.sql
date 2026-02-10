ALTER TABLE "projects" RENAME COLUMN "key" TO "slug";--> statement-breakpoint
DROP INDEX "projects_company_key_uq";--> statement-breakpoint
CREATE UNIQUE INDEX "projects_company_slug_uq" ON "projects" USING btree ("company_id","slug");