import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { CompanySchema } from '../company/company.entity'
import { WorkspaceMemberSchema } from '../workspace-members/workspace-members.entity'

export const WorkspaceSchema = pgTable('workspaces', {
    id: uuid().primaryKey().defaultRandom(),
    companyId: uuid('company_id')
        .notNull()
        .references(() => CompanySchema.id, { onDelete: 'cascade' }),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    description: text(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const WorkspaceRelations = relations(WorkspaceSchema, ({ one, many }) => ({
    company: one(CompanySchema, {
        fields: [WorkspaceSchema.companyId],
        references: [CompanySchema.id],
    }),
    members: many(WorkspaceMemberSchema),
}))
