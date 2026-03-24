import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv'
dotenv.config()

// Source - https://stackoverflow.com/a/79502172
// Posted by yffaffy
// Retrieved 2026-03-23, License - CC BY-SA 4.0

export default defineConfig({
    schema: './app/(Schema)/schema.ts',

    dbCredentials: {
        url: process.env.DATABASE_URL!
    },

    verbose: true,
    strict: true,
    dialect: 'postgresql'
});
