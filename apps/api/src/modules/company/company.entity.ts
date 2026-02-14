import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { CompanyMemberSchema } from '../company-members/company-members.entity'
import { UserSchema } from '../user/user.entity'

export const CompanySchema = pgTable('companies', {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull().unique(),
    description: text(),
    logoUrl: text('logo_url'),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => UserSchema.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const CompanyRelations = relations(CompanySchema, ({ one, many }) => ({
    createdBy: one(UserSchema, {
        fields: [CompanySchema.createdBy],
        references: [UserSchema.id],
    }),
    members: many(CompanyMemberSchema),
}))
