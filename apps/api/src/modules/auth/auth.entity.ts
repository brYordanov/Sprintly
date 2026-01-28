import { sql } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { UserSchema } from '../user/user.entity'

export const UserSessionSchema = pgTable(
    'user_session',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => UserSchema.id, { onDelete: 'cascade' }),
        refreshokenHash: text('refresh_token_hash').notNull(),
        userAgent: text('user_agent'),
        ip: text(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .notNull()
            .default(sql`now()`),
        expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
        revokedAt: timestamp('revoked_at', { withTimezone: true }),
        lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    },
    t => [
        index('user_session_user_id_idx').on(t.userId),
        index('user_session_expires_at_idx').on(t.expiresAt),
        index('user_sessions_token_hash_idx').on(t.refreshokenHash),
    ],
)
