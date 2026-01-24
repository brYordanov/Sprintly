import { Global, Module } from '@nestjs/common'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

export const PG_POOL = Symbol('PG_POOL')
export const DRIZZLE_DB = Symbol('DRIZZLE_DB')

@Global()
@Module({
    providers: [
        {
            provide: PG_POOL,
            useFactory: async () => {
                const pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                })

                await pool.query('select 1')
                return pool
            },
        },
        {
            provide: DRIZZLE_DB,
            useFactory: (pool: Pool) => {
                return drizzle(pool)
            },
            inject: [PG_POOL],
        },
    ],
    exports: [PG_POOL, DRIZZLE_DB],
})
export class DbModule {}
