-- Textos editables del hero de la home.
--
-- Agrega a SiteSettings las columnas de la insignia, el título, la palabra
-- destacada y el párrafo, para poder cambiarlos desde /admin/portada sin tocar
-- código (cambios de temporada, descuentos, etc.).
--
-- Las cuatro columnas son nullables y sin valor por defecto: cuando están en
-- null, la home usa los textos de HERO_DEFAULTS (src/lib/site-settings.ts).
-- Solo agrega columnas — no borra ni modifica datos existentes.
--
-- IMPORTANTE: aplicar ANTES de desplegar el código que las usa. getSiteSettings()
-- consulta sin `select` explícito y la home la llama en cada render, así que
-- mientras las columnas no existan el sitio entero devolvería error 500.

BEGIN;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "heroBadge" TEXT,
ADD COLUMN     "heroSubtitle" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "heroTitleAccent" TEXT;

COMMIT;
