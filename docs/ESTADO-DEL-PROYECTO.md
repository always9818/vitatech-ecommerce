# VITATECH — Estado del proyecto y pendientes

> Documento de traspaso. Está escrito para que un agente (o una persona) que
> llega sin contexto sepa en qué estado quedó el proyecto y qué falta hacer.
> Actualizado al 31 de julio de 2026.

---

## 1. Qué es esto

Tienda en línea (e-commerce) de tecnología para Guatemala, en producción.

| Pieza | Tecnología |
|---|---|
| Framework | **Next.js 16.2.10** (App Router) + React 19.2.4 + TypeScript |
| Estilos | Tailwind v4 |
| Base de datos | **PostgreSQL** vía **Prisma 6.19** (adaptador `@prisma/adapter-pg`), alojada en **Prisma Postgres** |
| Autenticación | NextAuth (Auth.js v5) con proveedor de credenciales propio (bcrypt) |
| Pagos | **Recurrente** (pasarela guatemalteca) — `src/lib/recurrente.ts` |
| Imágenes | **Cloudflare R2** (bucket `vitatech-product-images`) |
| Hosting | **Cloudflare Workers** vía `@opennextjs/cloudflare` |
| Dominio | `www.importadoravitatech.com` (+ el subdominio `.workers.dev`) |

⚠️ **Regla del repo** (`AGENTS.md`): esta versión de Next.js tiene cambios que
rompen compatibilidad con lo que el modelo "recuerda". Antes de escribir código,
consultar la guía correspondiente en `node_modules/next/dist/docs/`.

---

## 2. Estado de las ramas

```
main                                        → b90bb30 (lo que estaba estable)
claude/vitatech-cloudflare-domain-tq3s7f    → 4 commits por encima de main
```

Los 4 commits de la rama, del más viejo al más nuevo:

1. `52dd990` — Dominio personalizado en `wrangler.jsonc` **(este causó una caída; ver §4)**
2. `32d9bca` — Reseñas de clientes con moderación + cupones de descuento
3. `3930920` — Arreglo de la caída + tolerancia al esquema sin migrar
4. `85702a2` — SQL de la migración (`docs/migracion-resenas-cupones.sql`)

**La rama NO ha sido fusionada a `main`.**

---

## 3. ⚠️ LO QUE FALTA HACER (en este orden)

### Tarea A — Confirmar que el sitio está arriba

El deploy venía fallando. El arreglo ya está en la rama (commit `3930920`) pero
**no se pudo verificar** si el deploy posterior tuvo éxito, porque la sesión
donde se trabajó no tenía acceso de red ni a Cloudflare ni al sitio.

Primero: abrir `https://www.importadoravitatech.com` y ver si carga.

- **Si carga** → seguir a la Tarea B.
- **Si no carga** → revisar el log del build en Cloudflare
  (*Workers & Pages → vitatech-ecommerce → Builds*) y diagnosticar desde ahí.

### Tarea B — Aplicar la migración de base de datos

Las funciones nuevas (reseñas y cupones) necesitan tablas y columnas que
**todavía no existen** en la base de producción.

Opción 1 (preferida), desde la carpeta del proyecto con el `.env` configurado:

```bash
npx prisma db push
```

Opción 2, si `db push` no puede conectarse: pegar el contenido de
`docs/migracion-resenas-cupones.sql` en una consola SQL (por ejemplo el editor
de [console.prisma.io](https://console.prisma.io)). Ese script solo **crea**
cosas nuevas — no borra ni modifica datos existentes.

Qué crea: enums `ReviewStatus` y `CouponType`; tablas `Review` y `Coupon`;
columnas `Cart.couponId`, `Order.couponId` y `Order.couponDiscount`; más sus
índices y llaves foráneas.

> El `DATABASE_URL` está en las variables de entorno del Worker en Cloudflare y
> en la consola de Prisma. **No está en el repositorio y no debe subirse.**

### Tarea C — Fusionar a `main`

Una vez que A y B estén listas y verificadas, fusionar la rama a `main`.

---

## 4. Trampas ya descubiertas (no repetirlas)

### El bloque `routes` en `wrangler.jsonc` tumba el deploy

Declarar el dominio así:

```jsonc
"routes": [
  { "pattern": "www.importadoravitatech.com", "custom_domain": true }
]
```

hace que **cada** deploy intente reclamar el dominio contra
`/workers/scripts/.../domains/records`. Cuando esa llamada falla, wrangler
aborta con **`No targets deployed`**: el Worker queda subido pero la versión
nueva nunca se activa, y el sitio se cae.

El dominio ya está administrado desde el panel de Cloudflare y sobrevive a los
deploys por su cuenta. **No volver a declararlo en `wrangler.jsonc`.**

### Columnas nuevas + `select` implícito = sitio caído completo

Al agregar `Cart.couponId`, las consultas de Prisma sin `select` explícito
pedían esa columna. Como el `Header` llama a `cartCount()` en **todas** las
páginas, mientras la columna no existiera **el sitio entero** devolvía error
500 — no solo el carrito.

Por eso las lecturas de carrito ahora usan `select` explícito
(`src/lib/cart-actions.ts`, `src/lib/cart-merge.ts`) y las consultas de reseñas
y cupones degradan a vacío registrando el error en logs, en vez de propagar la
excepción.

**Lección general:** al agregar una columna a un modelo que se consulta en el
render de cada página, o se migra antes de desplegar, o la consulta se acota con
`select`.

Una vez aplicada la migración (Tarea B), estas defensas dejan de activarse solas
y las funciones nuevas empiezan a operar normal. **No hace falta quitarlas** —
siguen sirviendo de red de seguridad.

---

## 5. Funciones nuevas (ya programadas, esperando la migración)

### Reseñas de clientes

- Cualquier usuario con sesión puede dejar **una** reseña por producto
  (calificación 1–5 + comentario) desde la ficha del producto.
- Queda en estado `PENDING`; **no se publica** hasta que un administrador la
  apruebe en **`/admin/resenas`** (aprobar / rechazar / eliminar).
- Si el cliente edita su reseña, vuelve a quedar pendiente.
- La calificación que se muestra en la ficha se calcula de las reseñas
  aprobadas. Si un producto aún no tiene ninguna, usa los campos manuales
  `Product.rating` y `Product.reviews` como respaldo.
- Archivos: `src/lib/review-actions.ts`, `src/components/ReviewsSection.tsx`,
  `src/components/ReviewForm.tsx`, `src/app/admin/resenas/page.tsx`.

### Cupones de descuento

- Se administran en **`/admin/cupones`**: código, tipo (**porcentaje** o
  **monto fijo en Q**), vigencia opcional, límite de usos opcional,
  activar/desactivar.
- El cliente los aplica en el carrito (campo "Código de descuento"), que antes
  era decorativo y no hacía nada.
- El descuento se recalcula en el checkout y se guarda en la orden.
- El contador de usos **solo sube cuando Recurrente confirma el pago** (por
  webhook), no en checkouts abandonados.
- Como Recurrente cobra por línea de producto y no admite descuentos negativos,
  el cupón se reparte proporcionalmente entre las líneas enviadas
  (`applyDiscountToLineItems` en `src/lib/checkout-actions.ts`).
- Archivos: `src/lib/coupon-actions.ts`, `src/lib/coupon-utils.ts`,
  `src/components/CouponBox.tsx`, `src/app/admin/cupones/page.tsx`.

---

## 6. Notas de arquitectura útiles

- **Prisma en Workers:** el cliente se construye de forma perezosa y se
  memoiza *por request* (`src/lib/prisma.ts`). Un cliente no puede sobrevivir
  al request que abrió su socket TCP; reusarlo cuelga el runtime. No convertirlo
  en singleton global.
- **Carrito:** se persiste en la base de datos, no en `localStorage`. Por
  `userId` si hay sesión, o por una cookie `vt_guest_id` (httpOnly) si es
  invitado. Al iniciar sesión, el carrito de invitado se fusiona
  (`src/lib/cart-merge.ts`).
- **Subida de imágenes (R2):** solo funciona en el sitio desplegado, no en
  desarrollo local. No es un bug.
- **Administradores:** se marcan a mano en la base de datos
  (`User.role = 'ADMIN'`). Todavía no hay botón en el panel para otorgar el rol.
- **Webhook de Recurrente:** los nombres de campos del payload se implementaron
  contra el esquema público documentado. Conviene verificarlos contra
  https://docs.recurrente.com y los logs reales (`wrangler tail`).

---

## 7. Comandos

```bash
npm install            # instalar dependencias
npm run dev            # desarrollo local
npm run lint           # linter
npx tsc --noEmit       # verificar tipos
npm run build          # build de Next.js
npm run deploy         # build + deploy a Cloudflare Workers
npx prisma db push     # aplicar el esquema a la base de datos
npm run db:seed        # cargar productos de ejemplo
```

Antes de dar por bueno cualquier cambio: `npx tsc --noEmit`, `npm run lint` y
`npm run build` deben pasar los tres.

---

## 8. Documentación relacionada

- `docs/MANUAL-ADMIN.md` — manual del panel de administración, escrito para el
  dueño de la tienda (no técnico).
- `docs/migracion-resenas-cupones.sql` — el SQL de la Tarea B.
