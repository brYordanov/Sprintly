import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'
import { resolve } from 'node:path'

const env = process.env.NODE_ENV ?? 'dev'
dotenv.config({ path: resolve(__dirname, `../../.env${env}`) })

if (!process.env.DATABASE_URL) {
    const path = resolve(__dirname, `../../.env-${env}`)
    throw new Error(`DATABASE_URL is missing. Loaded env from: ${path}`)
}

export default defineConfig({
    dialect: 'postgresql',
    schema: ['./src/modules/**/*.schema-entity.ts', './src/db/schema.ts'],
    out: './src/db/drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
})
