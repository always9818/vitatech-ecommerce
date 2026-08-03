# Manual del Administrador — VITATECH

Guía para gestionar el catálogo de productos de la tienda desde el Panel de Administración.

**Sitio:** https://importadoravitatech.com

---

## 1. Cómo entrar al panel

1. Ve a `https://importadoravitatech.com/login`.
2. Inicia sesión con tu correo y contraseña (la cuenta que ya tienes marcada como administrador).
3. Dale clic al ícono de perfil (👤) arriba a la derecha, o entra directo a **Mi cuenta**.
4. Vas a ver un botón verde **"Panel de administración →"** — solo aparece si tu cuenta tiene permisos de administrador.
5. También puedes ir directo a: `https://importadoravitatech.com/admin/productos`

> Si intentas entrar a `/admin/productos` sin haber iniciado sesión, te manda a la pantalla de login. Si tu cuenta no es administrador, te regresa a la tienda.

### Entrar con Google

En la pantalla de login también está el botón **"Continuar con Google"**. Sirve para que tus clientes se registren en un clic, sin inventar contraseña.

- Si entras con Google usando **el mismo correo** de tu cuenta de administrador, se enlaza con la cuenta que ya tenías y **conservas tus permisos**.
- Una cuenta creada con Google no tiene contraseña. Si después intentas entrar con correo y contraseña, no va a funcionar: usa el botón de Google.
- Por seguridad solo aceptamos cuentas de Google con el **correo verificado**.

### Recuperar contraseña olvidada

En la pantalla de login, el enlace **"¿Olvidaste tu contraseña?"** manda un correo con un botón para crear una contraseña nueva.

- El enlace vence en **1 hora** y solo funciona **una vez**.
- Si un cliente pide el enlace varias veces, solo el más reciente funciona — los anteriores quedan inválidos.
- Por seguridad, la pantalla dice lo mismo exista o no esa cuenta ("si ese correo está registrado, te enviamos un enlace"), así nadie puede usarla para averiguar qué correos tienen cuenta en la tienda.

> **Pendiente:** el envío de correo necesita una llave de [Resend](https://resend.com) (servicio de correo transaccional, tiene plan gratuito). Sin ella configurada, el enlace no sale del servidor — avísame cuando quieras activarlo y te guío para crear la cuenta.

---

## 2. Pedidos (a dónde enviar cada compra)

Es la primera pestaña del panel: **Pedidos**. Ahí ves todo lo que te han comprado, del más reciente al más antiguo.

De cada pedido ves:

- **Quién compró** (nombre y correo, por si necesitas contactarlo).
- **Estado**: *Pendiente de pago* (todavía no paga), *Pagado* (ya puedes despachar), *Cancelado* o *Fallido*.
- **Productos** con cantidades y precios.
- **Entregar a**: nombre de quien recibe, teléfono, dirección completa con zona, municipio, departamento y el punto de referencia.

Arriba tienes el resumen: cuántos pedidos van, cuántos están pagados y cuánto has vendido (solo cuenta los pagados).

> **Despacha solo los que digan "Pagado".** Un pedido "Pendiente de pago" significa que el cliente llegó hasta la pantalla de pago pero no la completó.

> Los pedidos hechos **antes** de que existiera esta función no tienen dirección guardada. En esos casos verás un aviso y tendrás que escribirle al cliente por correo para confirmar a dónde enviarlo.

---

## 3. Ver y buscar productos

Al entrar al panel ves la lista completa de productos: nombre, SKU, categoría, marca, precio y stock disponible.

- Usa el buscador de arriba para filtrar por **nombre o SKU**.
- El stock en **rojo** significa que el producto está agotado (0 unidades) — sigue apareciendo en la tienda pero marcado como "Agotado" y sin poder agregarse al carrito.

---

## 4. Crear un producto nuevo

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

**Importante sobre las fotos:** la subida de imágenes **solo funciona en el sitio real** (`importadoravitatech.com`). Si en algún momento se prueba en un entorno de desarrollo local, la subida de fotos no va a funcionar — es una limitación técnica del almacenamiento de imágenes (Cloudflare R2), no un error.

---

## 5. Editar un producto

1. En la lista, dale clic a **"Editar"** junto al producto que quieras cambiar.
2. El formulario aparece con todos los datos actuales ya llenos.
3. Cambia lo que necesites (precio, stock, descripción, etc.).
4. Si quieres **reemplazar la foto**: sube una nueva en el campo "Foto de producto" — la anterior se reemplaza automáticamente.
5. Si quieres **quitar la foto** sin subir una nueva: dale clic a "Quitar foto" (aparece debajo de la foto actual), y el producto volverá a mostrar solo el ícono de respaldo.
6. Dale clic a **"Guardar cambios"**.

> Las fotos que subas ahora sí se muestran en la tienda: en la tarjeta del catálogo, en la ficha del producto y en el carrito. Mientras un producto no tenga foto, se ve el ícono de línea que hayas elegido.

---

## 6. Eliminar un producto

1. En la lista, dale clic a **"Eliminar"**.
2. Te pide confirmar — dale "Aceptar" si estás seguro (esta acción no se puede deshacer).

**Si un producto ya fue comprado alguna vez o está en el carrito de algún cliente**, el sistema no lo va a dejar eliminar (para no romper el historial de pedidos) y te va a mostrar un mensaje de aviso. En ese caso, la alternativa es **editar el producto y poner el Stock en 0** — así desaparece la posibilidad de comprarlo mientras se mantiene el historial intacto.

---

## 7. Categorías y marcas

1. En el menú del panel, dale clic a **"Categorías y marcas"**.
2. Vas a ver dos columnas: **Categorías** y **Marcas**, cada una con su propia lista y su propio campo para agregar una nueva.
3. Escribe el nombre y dale clic a **"Agregar"** — aparece de inmediato en la lista, y ya queda disponible para elegirla al crear o editar un producto.
4. Para eliminar una, dale clic a **"Eliminar"** junto a ella.

**Si una categoría o marca ya tiene productos asignados**, el sistema no te va a dejar eliminarla (para no dejar productos huérfanos) — primero tendrías que cambiar esos productos a otra categoría/marca.

---

## 8. Portada: textos y carrusel de diseños

En el menú del panel, dale clic a **"Portada"**. Tiene dos partes.

### Textos
El título grande, la etiqueta de temporada y el texto de abajo. Cámbialos para anunciar una promoción o un descuento.

### Carrusel de diseños
Son las imágenes grandes que se ven debajo del texto, a todo lo ancho de la página.

1. En **"Agregar un diseño"**, elige la imagen (JPG, PNG, WEBP o GIF, máximo 5 MB).
2. **Enlace** (opcional): a dónde va el cliente al hacer clic. Tiene que empezar con `/` y ser una página de tu tienda, por ejemplo `/catalogo?cat=Laptops`. Si lo dejas vacío, la imagen no es clicable.
3. **Descripción** (opcional): se lee en voz alta para personas con discapacidad visual y aparece si la imagen no carga.
4. Dale a **"Agregar al carrusel"**.

**Sobre el orden:** las flechas ↑ ↓ mueven cada diseño. **El primero de la lista es el que ve el cliente al entrar.**

**Cómo se comporta:**
- Con **un solo diseño**, se muestra fijo, sin flechas.
- Con **dos o más**, rotan solos cada 6 segundos. El cliente puede pasarlos con las flechas o los puntos, y la rotación se detiene mientras tiene el cursor encima.

> **Consejo de tamaño:** diseña las imágenes **apaisadas**, por ejemplo **1600 × 700 px**. La imagen siempre se ve completa (nunca se recorta), así que una imagen cuadrada o vertical va a dejar franjas vacías a los lados y se verá más pequeña.

---

## 9. Páginas del pie de página (Tiendas, Envíos, Garantías, Soporte, Términos)

Estos 5 enlaces del pie de página ya llevan a páginas reales (antes no hacían nada). Por ahora tienen texto de ejemplo genérico — avísame cuándo tengas el contenido real de cada una (direcciones de tiendas, política de envíos, texto legal, etc.) y lo actualizo. No hay todavía un editor en el panel para estas páginas; el cambio lo hago yo directamente en el código.

---

## 10. Preguntas frecuentes

**¿Puedo dar acceso de administrador a otra persona?**
Por ahora esto no tiene un botón en el panel — hay que hacerlo manualmente en la base de datos. Si necesitas agregar otro administrador, dime el correo de esa cuenta (ya debe estar registrada en la tienda) y lo configuro.

**¿Qué pasa si subo una foto muy pesada?**
El sistema rechaza archivos de más de 5 MB con un mensaje de error — no se sube nada, puedes intentar de nuevo con una imagen más liviana.

**¿Los cambios se ven de inmediato en la tienda?**
Sí — en cuanto guardas, la home y el catálogo se actualizan al instante para cualquier visitante nuevo.
