import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const CompanySchema = pgTable('companies', {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull().unique(),
    description: text(),
    logoUrl: text('logo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
