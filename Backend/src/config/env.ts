import "dotenv/config";
import { z } from "zod";

/**
 * Validación de las variables de entorno.
 *
 * `import "dotenv/config"` carga el archivo Backend/.env cuando se corre fuera
 * de Docker (npm run dev). Dentro de Docker el .env no está en la imagen
 * (.dockerignore) y las variables llegan por `env_file` de docker-compose;
 * dotenv simplemente no encuentra el archivo y no pisa nada.
 *
 * Si falta alguna variable obligatoria el proceso termina: es preferible que la
 * API no arranque a que arranque firmando tokens con un secreto indefinido.
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string("DATABASE_URL debe ser texto")
    .min(1, "DATABASE_URL es obligatoria"),
  JWT_SECRET: z
    .string("JWT_SECRET debe ser texto")
    .min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string("JWT_EXPIRES_IN debe ser texto").default("1d"),
  BCRYPT_ROUNDS: z.coerce
    .number("BCRYPT_ROUNDS debe ser un número")
    .int("BCRYPT_ROUNDS debe ser un número entero")
    .min(4, "BCRYPT_ROUNDS mínimo 4")
    .max(15, "BCRYPT_ROUNDS máximo 15")
    .default(10),
  PORT: z.coerce
    .number("PORT debe ser un número")
    .int("PORT debe ser un número entero")
    .positive("PORT debe ser un número positivo")
    .default(3000),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error("Variables de entorno inválidas:");
  for (const issue of resultado.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = resultado.data;
