import { config } from "dotenv";

config({ path: ".env.local" });
config();

export default {
  dialect: "postgresql",
  schema: "./utils/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
