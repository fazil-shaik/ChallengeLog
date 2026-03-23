import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/(Schema)",
  out: "./drizzle",

    driver: "pglite",
    dbCredentials: {
    url: './db',
  },
});

