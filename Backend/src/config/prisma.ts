import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

// Se importa `env` (y no process.env directamente) para garantizar que dotenv
// ya cargó el archivo .env antes de leer la cadena de conexión.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
