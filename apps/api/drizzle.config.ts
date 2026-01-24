import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'
import { resolve } from 'node:path'

dotenv.config({ path: resolve(__dirname, '../../.env-dev') })

if (!process.env.DATABASE_URL) {
    throw new Error(
        `DATABASE_URL is missing. Loaded env from: ${resolve(__dirname, '../../.env-dev')}`,
    )
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './src/db/drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
})
