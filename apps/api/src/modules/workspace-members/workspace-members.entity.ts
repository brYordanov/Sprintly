import { relations } from 'drizzle-orm'
import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'
import { UserSchema } from '../user/user.entity'
import { WorkspaceSchema } from '../workspace/workspace.entity'

export const WorkspaceMemberSchema = pgTable(
    'workspace_members',
    {
        workspaceId: uuid('workspace_id')
            .notNull()
            .references(() => WorkspaceSchema.id, { onDelete: 'cascade' }),
        userId: uuid('user_id')
            .notNull()
            .references(() => UserSchema.id, { onDelete: 'cascade' }),
        joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    },
    t => [primaryKey({ columns: [t.workspaceId, t.userId] })],
)

export const WorkspaceMemberRelations = relations(WorkspaceMemberSchema, ({ one }) => ({
    workspace: one(WorkspaceSchema, {
        fields: [WorkspaceMemberSchema.workspaceId],
        references: [WorkspaceSchema.id],
    }),
    user: one(UserSchema, {
        fields: [WorkspaceMemberSchema.userId],
        references: [UserSchema.id],
    }),
}))
