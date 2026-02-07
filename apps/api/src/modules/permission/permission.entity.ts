import { integer, pgTable, primaryKey, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { CompanySchema } from '../company/company.entity'
import { ProjectSchema } from '../project/project.entity'
import { UserSchema } from '../user/user.entity'
import { WorkspaceSchema } from '../workspace/workspace.entity'

export const PermissionSchema = pgTable('permissions', {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar().notNull().unique(),
    level: integer().notNull(),
})

export const UserCompanyPermissionSchema = pgTable(
    'users_company_permissions',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => UserSchema.id),
        companyId: uuid('company_id')
            .notNull()
            .references(() => CompanySchema.id, { onDelete: 'cascade' }),
        permissionId: uuid('permission_id')
            .notNull()
            .references(() => PermissionSchema.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    t => [primaryKey({ columns: [t.userId, t.companyId] })],
)

export const UserWorkspacePermissionSchema = pgTable(
    'users_workspace_permissions',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => UserSchema.id),
        workspaceId: uuid('workspace_id')
            .notNull()
            .references(() => WorkspaceSchema.id, { onDelete: 'cascade' }),
        permissionId: uuid('permission_id')
            .notNull()
            .references(() => PermissionSchema.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    t => [primaryKey({ columns: [t.userId, t.workspaceId] })],
)

export const UserProjectPermissionSchema = pgTable(
    'users_project_permissions',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => UserSchema.id),
        projectId: uuid('project_id')
            .notNull()
            .references(() => ProjectSchema.id, { onDelete: 'cascade' }),
        permissionId: uuid('permission_id')
            .notNull()
            .references(() => PermissionSchema.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    t => [primaryKey({ columns: [t.userId, t.projectId] })],
)
