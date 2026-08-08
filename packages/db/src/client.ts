import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../generated/prisma/index.js";

// The default native query engine loads a binary via code that isn't
// bundler-safe (breaks with "__dirname is not defined" under Vercel's
// Node.js Function bundler). Neon's driver adapter queries over
// WebSocket/HTTP instead, so there's no native engine to load.
neonConfig.webSocketConstructor = ws;

// One pool/client for every service — schema targeting is handled by the
// `multiSchema` feature + `@@schema(...)` on every model in schema.prisma
// (fully-qualified table names), not by per-service connection strings.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter });
