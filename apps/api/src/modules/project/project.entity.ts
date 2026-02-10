import { pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { CompanySchema } from '../company/company.entity'
import { WorkspaceSchema } from '../workspace/workspace.entity'

export const ProjectSchema = pgTable(
    'projects',
    {
        id: uuid().primaryKey().defaultRandom(),
        companyId: uuid('company_id')
            .notNull()
            .references(() => CompanySchema.id, { onDelete: 'cascade' }),
        workspaceId: uuid('workspace_id').references(() => WorkspaceSchema.id, {
            onDelete: 'set null',
        }),
        name: varchar({ length: 100 }).notNull(),
        slug: varchar({ length: 10 }).notNull(),
        description: text(),
        iconUrl: text('icon_url'),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    t => [uniqueIndex('projects_company_slug_uq').on(t.companyId, t.slug)],
)
