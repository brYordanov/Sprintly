import { relations } from 'drizzle-orm'
import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'
import { CompanySchema } from '../company/company.entity'
import { UserSchema } from '../user/user.entity'

export const CompanyMemberSchema = pgTable(
    'company_members',
    {
        companyId: uuid('company_id')
            .notNull()
            .references(() => CompanySchema.id, { onDelete: 'cascade' }),
        userId: uuid('user_id')
            .notNull()
            .references(() => UserSchema.id, { onDelete: 'cascade' }),
        joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    },
    t => [primaryKey({ columns: [t.companyId, t.userId] })],
)

export const CompanyMemberRelations = relations(CompanyMemberSchema, ({ one }) => ({
    company: one(CompanySchema, {
        fields: [CompanyMemberSchema.companyId],
        references: [CompanySchema.id],
    }),
    user: one(UserSchema, {
        fields: [CompanyMemberSchema.userId],
        references: [UserSchema.id],
    }),
}))
