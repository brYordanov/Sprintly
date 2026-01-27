import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { resolve } from 'node:path'

const env = process.env.NODE_ENV ?? 'dev'
const path = resolve(__dirname, `../../.env-${env}`)
dotenv.config({ path })

if (!process.env.DATABASE_URL) {
    throw new Error(`DATABASE_URL is missing. Loaded env from: ${path}`)
}

export default defineConfig({
    dialect: 'postgresql',
    schema: ['./src/db/drizzle-entrypoint.ts'],
    out: './src/db/drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
})
