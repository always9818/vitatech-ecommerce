-- Checkout sin cuenta obligatoria (2026-08-06).
--
-- Antes `Order.userId` era obligatorio, así que no existía forma de guardar un
-- pedido de alguien que no se hubiera registrado: el checkout cortaba con
-- "Debes iniciar sesión para finalizar tu compra".
--
-- Los tres cambios son compatibles hacia atrás: aflojar un NOT NULL nunca
-- invalida filas existentes, y las dos columnas nuevas nacen en NULL. Los
-- pedidos anteriores conservan su `userId` tal cual.

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestId" TEXT;
