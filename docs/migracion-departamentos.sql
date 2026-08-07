-- Departamentos: Tecnología y Salud y Bienestar (2026-08-07).
--
-- El nombre VITATECH siempre fue literal ("VITA" de vitaminas, "TECH" de
-- tecnología), pero la tienda solo vendía tecnología. Este cambio abre el
-- segundo departamento sin tocar nada de lo que ya existía.
--
-- Es compatible hacia atrás: la columna nace con DEFAULT 'TECNOLOGIA', así que
-- las categorías actuales (Laptops, Celulares, Audio, Accesorios) se quedan
-- exactamente donde estaban y ningún producto cambia de lugar.

-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Department') THEN
    CREATE TYPE "Department" AS ENUM ('TECNOLOGIA', 'SALUD');
  END IF;
END
$$;

-- AlterTable
ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "department" "Department" NOT NULL DEFAULT 'TECNOLOGIA';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Category_department_idx" ON "Category"("department");

-- Primera categoría del departamento nuevo. Angel puede renombrarla, borrarla
-- o agregar más (Vitaminas, Proteínas, etc.) desde /admin/categorias.
-- ON CONFLICT para que correr esta migración dos veces no falle.
INSERT INTO "Category" ("id", "name", "department")
VALUES ('cat_suplementos_deportivos', 'Suplementos deportivos', 'SALUD')
ON CONFLICT ("name") DO NOTHING;
