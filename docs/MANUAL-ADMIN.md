# Manual del Administrador — VITATECH

Guía para gestionar el catálogo de productos de la tienda desde el Panel de Administración.

**Sitio:** https://vitatech-ecommerce.angelvasquez201010.workers.dev

---

## 1. Cómo entrar al panel

1. Ve a `https://vitatech-ecommerce.angelvasquez201010.workers.dev/login`.
2. Inicia sesión con tu correo y contraseña (la cuenta que ya tienes marcada como administrador).
3. Dale clic al ícono de perfil (👤) arriba a la derecha, o entra directo a **Mi cuenta**.
4. Vas a ver un botón verde **"Panel de administración →"** — solo aparece si tu cuenta tiene permisos de administrador.
5. También puedes ir directo a: `https://vitatech-ecommerce.angelvasquez201010.workers.dev/admin/productos`

> Si intentas entrar a `/admin/productos` sin haber iniciado sesión, te manda a la pantalla de login. Si tu cuenta no es administrador, te regresa a la tienda.

---

## 2. Ver y buscar productos

Al entrar al panel ves la lista completa de productos: nombre, SKU, categoría, marca, precio y stock disponible.

- Usa el buscador de arriba para filtrar por **nombre o SKU**.
- El stock en **rojo** significa que el producto está agotado (0 unidades) — sigue apareciendo en la tienda pero marcado como "Agotado" y sin poder agregarse al carrito.

---

## 3. Crear un producto nuevo

1. Dale clic a **"+ Nuevo producto"**.
2. Llena los campos:

| Campo | Qué poner |
|---|---|
| Nombre del producto | El nombre que verán tus clientes |
| SKU | Código interno único (no puede repetirse) |
| Categoría / Marca | Elige de la lista — si necesitas una categoría o marca nueva, avísame para agregarla |
| Precio actual (Q) | El precio que se cobra hoy |
| Precio de lista (Q) | El precio "antes del descuento" — si no hay descuento, pon el mismo valor que el precio actual |
| Stock disponible | Cuántas unidades hay en inventario |
| Ícono de respaldo | Se elige de una lista (Laptop, Celular, Monitor, Audífonos, Impresora…). Es el dibujo de línea que se muestra mientras el producto todavía no tiene foto |
| Calificación (0-5) y Reseñas | Para mostrar estrellas en la tarjeta del producto |
| Descripción | Texto que se ve en la ficha del producto |
| Especificaciones técnicas | Una línea por especificación, formato `Nombre: Valor`. Ejemplo:<br>`Procesador: AMD Ryzen 5`<br>`Memoria RAM: 16GB`<br>`Almacenamiento: 512GB SSD` |
| Foto de producto | Sube una imagen (JPG, PNG, WEBP o GIF, máximo 5 MB) |

3. Dale clic a **"Crear producto"**.
4. Te regresa automáticamente a la lista, con el producto ya creado arriba de todo.

**Importante sobre las fotos:** la subida de imágenes **solo funciona en el sitio real** (`vitatech-ecommerce.angelvasquez201010.workers.dev`). Si en algún momento se prueba en un entorno de desarrollo local, la subida de fotos no va a funcionar — es una limitación técnica del almacenamiento de imágenes (Cloudflare R2), no un error.

---

## 4. Editar un producto

1. En la lista, dale clic a **"Editar"** junto al producto que quieras cambiar.
2. El formulario aparece con todos los datos actuales ya llenos.
3. Cambia lo que necesites (precio, stock, descripción, etc.).
4. Si quieres **reemplazar la foto**: sube una nueva en el campo "Foto de producto" — la anterior se reemplaza automáticamente.
5. Si quieres **quitar la foto** sin subir una nueva: dale clic a "Quitar foto" (aparece debajo de la foto actual), y el producto volverá a mostrar solo el emoji de respaldo.
6. Dale clic a **"Guardar cambios"**.

> Las fotos que subas ahora sí se muestran en la tienda: en la tarjeta del catálogo, en la ficha del producto y en el carrito. Mientras un producto no tenga foto, se ve el ícono de línea que hayas elegido.

---

## 5. Eliminar un producto

1. En la lista, dale clic a **"Eliminar"**.
2. Te pide confirmar — dale "Aceptar" si estás seguro (esta acción no se puede deshacer).

**Si un producto ya fue comprado alguna vez o está en el carrito de algún cliente**, el sistema no lo va a dejar eliminar (para no romper el historial de pedidos) y te va a mostrar un mensaje de aviso. En ese caso, la alternativa es **editar el producto y poner el Stock en 0** — así desaparece la posibilidad de comprarlo mientras se mantiene el historial intacto.

---

## 6. Preguntas frecuentes

**¿Puedo dar acceso de administrador a otra persona?**
Por ahora esto no tiene un botón en el panel — hay que hacerlo manualmente en la base de datos. Si necesitas agregar otro administrador, dime el correo de esa cuenta (ya debe estar registrada en la tienda) y lo configuro.

**¿Puedo agregar categorías o marcas nuevas?**
Todavía no hay un formulario para eso en el panel — es una mejora pendiente. Mientras tanto, avísame qué categoría o marca necesitas y la agrego.

**¿Qué pasa si subo una foto muy pesada?**
El sistema rechaza archivos de más de 5 MB con un mensaje de error — no se sube nada, puedes intentar de nuevo con una imagen más liviana.

**¿Los cambios se ven de inmediato en la tienda?**
Sí — en cuanto guardas, la home y el catálogo se actualizan al instante para cualquier visitante nuevo.
