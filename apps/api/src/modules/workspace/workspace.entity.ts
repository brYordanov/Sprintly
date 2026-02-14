import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { CompanySchema } from '../company/company.entity'
import { UserSchema } from '../user/user.entity'

export const WorkspaceSchema = pgTable('workspaces', {
    id: uuid().primaryKey().defaultRandom(),
    companyId: uuid('company_id')
        .notNull()
        .references(() => CompanySchema.id, { onDelete: 'cascade' }),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    description: text(),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => UserSchema.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const WorkspaceRelations = relations(WorkspaceSchema, ({ one }) => ({
    createdBy: one(UserSchema, {
        fields: [WorkspaceSchema.createdBy],
        references: [UserSchema.id],
    }),
    company: one(CompanySchema, {
        fields: [WorkspaceSchema.companyId],
        references: [CompanySchema.id],
    }),
}))
