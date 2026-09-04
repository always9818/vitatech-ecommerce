-- Verificación de correo al registrarse (arreglo 06 de la auditoría 2026-08-27).
--
-- Todo es ADITIVO: una columna nueva que admite nulos y una tabla nueva. No
-- toca ni una fila existente, así que el código que ya está desplegado sigue
-- funcionando igual mientras esto se aplica.
--
-- Se aplica con:  node scripts/aplicar-migracion.mjs docs/migracion-verificacion-correo.sql User
-- y después:      npx prisma generate

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key"
    ON "EmailVerificationToken"("tokenHash");

CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx"
    ON "EmailVerificationToken"("userId");

-- ADD CONSTRAINT no admite IF NOT EXISTS, así que se comprueba a mano para que
-- volver a correr el archivo no reviente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EmailVerificationToken_userId_fkey'
  ) THEN
    ALTER TABLE "EmailVerificationToken"
      ADD CONSTRAINT "EmailVerificationToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Las cuentas creadas con Google ya vienen con el correo verificado por Google
-- (el callback de auth.ts exige `email_verified`), así que no tiene sentido
-- pedirles que lo confirmen otra vez: se marcan las que no tienen contraseña.
UPDATE "User" SET "emailVerified" = "createdAt"
 WHERE "passwordHash" IS NULL AND "emailVerified" IS NULL;
