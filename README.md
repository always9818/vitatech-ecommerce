This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## VITATECH — implementación real

Implementación en stack real del handoff de diseño `design_handoff_vitatech_ecommerce/README.md`:

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **PostgreSQL + Prisma 7** (driver adapter `@prisma/adapter-pg`) — base de datos temporal de Prisma Postgres creada con `create-db`. **Reclámala antes de que expire** en https://create-db.prisma.io/claim?projectID=proj_cmr5ik1si0axlysfag2ensv3g o reemplaza `DATABASE_URL` en `.env` por tu propio Postgres.
- **NextAuth.js (Auth.js v5)** con proveedor de credenciales propio (bcrypt + Prisma)
- **Recurrente** (pasarela de pagos guatemalteca) para el checkout — ver `src/lib/recurrente.ts`

### Configurar

1. `npm install`
2. Revisa `.env` — ya trae `DATABASE_URL` y `AUTH_SECRET` funcionales para desarrollo.
3. Reemplaza `RECURRENTE_PUBLIC_KEY` / `RECURRENTE_SECRET_KEY` / `RECURRENTE_WEBHOOK_SECRET` con las llaves reales de tu cuenta en https://app.recurrente.com (Settings → API Keys) para que el checkout funcione de verdad; con las llaves de prueba actuales el botón "Finalizar compra" falla de forma controlada mostrando el error de autenticación de Recurrente.
4. `npx prisma db push` (o `migrate dev`) si cambias el esquema.
5. `npm run db:seed` para cargar los 12 productos de ejemplo del handoff.
6. `npm run dev`.

### Notas de la implementación

- El carrito se persiste en la base de datos (`Cart`/`CartItem`), no en `localStorage`: por `userId` si hay sesión, o por una cookie `vt_guest_id` httpOnly si es invitado. **No hay merge automático** del carrito de invitado al carrito del usuario al iniciar sesión — es una mejora pendiente si se necesita.
- El checkout requiere sesión iniciada; crea una `Order` en estado `PENDING`, genera una sesión de pago en Recurrente y redirige. El webhook (`/api/webhooks/recurrente`) marca la orden como `PAID`, descuenta stock y vacía el carrito al recibir `payment.completed` / `checkout.completed`.
- Verifica los nombres exactos de campos del payload de Recurrente (`src/lib/recurrente.ts`) contra https://docs.recurrente.com antes de producción — se implementó con el esquema público documentado (checkouts + items + success/cancel URL + webhook firmado con HMAC-SHA256), pero Recurrente puede ajustar detalles menores entre versiones.
- Las specs técnicas de producto ahora viven en `Product.specs` (JSON) en vez de derivarse en el cliente por categoría, tal como sugería el handoff.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
