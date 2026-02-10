import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { CompanyMemberSchema } from '../company-members/company-members.entity'
import { WorkspaceMemberSchema } from '../workspace-members/workspace-members.entity'

export const userStatusEnum = pgEnum('user_status', ['active', 'deleted'])

export const UserSchema = pgTable(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        email: varchar('email', { length: 320 }).notNull(),
        emailNormalized: varchar('email_normalized', { length: 320 }).notNull(),
        passHash: text('password_hash').notNull(),
        status: userStatusEnum('status').notNull().default('active'),
        username: varchar('username', { length: 32 }).notNull(),
        fullname: varchar('fullname', { length: 120 }),
        avatarUrl: text('avatar_url'),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
        emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    },
    t => [
        uniqueIndex('users_email_uq').on(t.emailNormalized),
        uniqueIndex('users_username_uq').on(t.username),
    ],
)

export const UserRelations = relations(UserSchema, ({ many }) => ({
    companyMemberships: many(CompanyMemberSchema),
    workspaceMemberships: many(WorkspaceMemberSchema),
}))
