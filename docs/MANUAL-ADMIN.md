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

> El correo sale desde `noreply@notificaciones.importadoravitatech.com`, un subdominio verificado aparte para no interferir con tu correo normal de Zoho.

---

## 2. Pedidos (a dónde enviar cada compra)

Es la primera pestaña del panel: **Pedidos**. Ahí ves todo lo que te han comprado, del más reciente al más antiguo.

De cada pedido ves:

- **Quién compró** (nombre y correo, por si necesitas contactarlo). Si el pedido lleva la etiqueta **INVITADO**, esa persona compró **sin crear cuenta**: el nombre es el de quien recibe el envío y el correo es el que dejó en el formulario. Para ti funciona igual — le escribes a ese correo y listo.
- **Estado**: *Pendiente de pago* (todavía no paga), *Pagado* (ya puedes despachar), *Cancelado* o *Fallido*.
- **Productos** con cantidades y precios.
- **Entregar a**: nombre de quien recibe, teléfono, dirección completa con zona, municipio, departamento y el punto de referencia.

Arriba tienes el resumen: cuántos pedidos van, cuántos están pagados y cuánto has vendido (solo cuenta los pagados).

> **Despacha solo los que digan "Pagado".** Un pedido "Pendiente de pago" significa que el cliente llegó hasta la pantalla de pago pero no la completó.

> Los pedidos hechos **antes** de que existiera esta función no tienen dirección guardada. En esos casos verás un aviso y tendrás que escribirle al cliente por correo para confirmar a dónde enviarlo.

> **Desde agosto de 2026 se puede comprar sin crear cuenta.** Antes el cliente tenía que registrarse antes de pagar, y esa es la razón #1 por la que la gente abandona un carrito. Ahora solo deja su correo. Los clientes que sí tienen cuenta siguen viendo su historial en "Mi cuenta"; un invitado no, porque no hay cuenta donde guardarlo — por eso su correo es importante.

---

## 3. Ver y buscar productos

Al entrar al panel ves la lista completa de productos: nombre, SKU, categoría, marca, precio y stock disponible.

- Usa el buscador de arriba para filtrar por **nombre o SKU**.
- El stock en **rojo** significa que el producto está agotado (0 unidades). Sigue apareciendo en la tienda marcado como "Agotado" y sin poder agregarse al carrito, pero **se va solo hasta el final del catálogo** y **sale de los Destacados de la portada**, para que nunca le quite el lugar a algo que sí puedes vender. En cuanto le cargues stock, vuelve a su sitio solo. Si prefieres que no se vea del todo, usa **Ocultar** (sección 6).
- Los productos marcados **"Oculto"** no los ve ningún cliente, pero siguen aquí para que puedas volver a mostrarlos.

---

## 4. Crear un producto nuevo

1. Dale clic a **"+ Nuevo producto"**.
2. Llena los campos:

| Campo | Qué poner |
|---|---|
| Nombre del producto | El nombre que verán tus clientes |
| SKU | Código interno único (no puede repetirse) |
| Categoría / Marca | Elige de la lista. Las categorías salen **agrupadas por departamento** (Tecnología / Salud y Bienestar): la que elijas decide en qué mitad de la tienda aparece el producto. Si necesitas una categoría nueva, la creas tú desde "Categorías y marcas" |
| Precio actual (Q) | El precio que se cobra hoy |
| Precio de lista (Q) | El precio "antes del descuento" — si no hay descuento, pon el mismo valor que el precio actual |
| Stock disponible | Cuántas unidades hay en inventario |
| Ícono de respaldo | Se elige de una lista. Para tecnología: Laptop, Celular, Monitor, Audífonos, Impresora… Para suplementos: **Bote de suplemento, Cápsulas o tabletas, Deportivo, Natural, Bienestar**. Es el dibujo de línea que se muestra mientras el producto todavía no tiene foto |
| Descripción | Texto que se ve en la ficha del producto |
| Especificaciones | Una línea por especificación, formato `Nombre: Valor`. Debajo del cuadro hay **botones de plantilla** (Tecnología, Suplemento, Proteína en polvo) que te lo dejan casi listo — solo llenas los valores |
| Fotos del producto | Puedes seleccionar **varias a la vez** (JPG, PNG, WEBP o GIF, máximo 5 MB cada una). La primera que subas es la que se ve en el catálogo y en las tarjetas; el cliente puede ver las demás haciendo clic en las miniaturas de la ficha |

3. Dale clic a **"Crear producto"**.
4. Te regresa automáticamente a la lista, con el producto ya creado arriba de todo.

**Importante sobre las fotos:** la subida de imágenes **solo funciona en el sitio real** (`importadoravitatech.com`). Si en algún momento se prueba en un entorno de desarrollo local, la subida de fotos no va a funcionar — es una limitación técnica del almacenamiento de imágenes (Cloudflare R2), no un error.

### Al subir un suplemento o vitamina

Es igual que cualquier producto, con tres cosas propias:

- **Elige una categoría del departamento "Salud y Bienestar"** — eso es lo único que hace que aparezca en esa sección de la tienda.
- **Usa la plantilla "Suplemento" o "Proteína en polvo"** en Especificaciones. Trae los campos que el cliente de verdad pregunta: presentación, contenido neto, porción, porciones por envase, sabor y registro sanitario.
- **En la descripción, copia lo que dice la etiqueta del fabricante.** No escribas que sirve para curar, tratar o prevenir enfermedades: un suplemento no es un medicamento, y prometerlo es lo que puede meterte en un problema legal o en un reclamo. La ficha ya muestra sola, en todos los productos de este departamento, el aviso de que es un suplemento alimenticio y que hay que consultar al médico.

---

## 5. Editar un producto

1. En la lista, dale clic a **"Editar"** junto al producto que quieras cambiar.
2. El formulario aparece con todos los datos actuales ya llenos.
3. Cambia lo que necesites (precio, stock, descripción, etc.).
4. Vas a ver las fotos que ya tiene el producto, cada una con una **X** para quitarla. La que dice "Principal" es la que se ve en el catálogo.
5. Para **agregar fotos nuevas** (sin perder las que ya tiene), selecciónalas en el campo de abajo — puedes elegir varias a la vez, o repetir el paso para ir agregando de a poco.
6. Para **quitar una foto**, dale clic a la X en su esquina. Se quita de la vista al instante; no se borra de verdad hasta que le des a "Guardar cambios".
7. Si quitas todas las fotos, el producto vuelve a mostrar solo el ícono de respaldo.
8. Dale clic a **"Guardar cambios"**.

> Las fotos que subas ahora sí se muestran en la tienda: en la tarjeta del catálogo, en la ficha del producto y en el carrito. Si subes más de una, el cliente puede pasar entre ellas haciendo clic en las miniaturas debajo de la foto grande de la ficha. Mientras un producto no tenga ninguna foto, se ve el ícono de línea que hayas elegido.

---

## 6. Ocultar o eliminar un producto

Tienes dos opciones, y sirven para cosas distintas.

### Ocultar (lo más común)

Dale clic a **"Ocultar"** en la fila del producto. Desaparece por completo de la tienda: catálogo, buscador, destacados, los contadores de categoría y hasta su enlace directo (si alguien lo tenía guardado, ahora ve "página no encontrada").

**No se borra nada.** El producto sigue en tu panel marcado como **"Oculto"**, y los pedidos donde ya aparece se conservan intactos. Para volver a venderlo, dale a **"Mostrar"**.

Úsalo cuando el producto se agotó, lo diste de baja temporalmente, o simplemente ya no quieres ofrecerlo.

> **Ojo:** poner el stock en 0 **no** lo oculta. El cliente lo sigue viendo marcado "Agotado", solo que hasta el final del catálogo y ya no en los Destacados. Eso es a propósito: el enlace del producto se conserva (junto con lo que Google ya tenga indexado) y vuelve a su lugar solo cuando le cargas existencias. Si de plano no quieres que aparezca, usa **Ocultar**.

### Eliminar (definitivo)

Dale clic a **"Eliminar"** y confirma. Esto sí borra el producto para siempre.

- Si el producto estaba **en el carrito de alguien**, no hay problema: se quita de ese carrito y se elimina. Un carrito es algo pasajero.
- Si el producto **ya aparece en algún pedido**, el sistema **no te va a dejar borrarlo**, y te lo dirá. No es un error: si se borrara, ese pedido pasaría a decir "producto desconocido" y perderías el registro de qué vendiste. **Para esos casos usa Ocultar.**

---

## 7. Categorías y marcas

1. En el menú del panel, dale clic a **"Categorías y marcas"**.
2. Vas a ver dos columnas: **Categorías** y **Marcas**, cada una con su propia lista y su propio campo para agregar una nueva.
3. Escribe el nombre, **elige el departamento** (ver abajo) y dale clic a **"Agregar"** — aparece de inmediato en la lista, y ya queda disponible para elegirla al crear o editar un producto.
4. Para eliminar una, dale clic a **"Eliminar"** junto a ella.

**Si una categoría o marca ya tiene productos asignados**, el sistema no te va a dejar eliminarla (para no dejar productos huérfanos) — primero tendrías que cambiar esos productos a otra categoría/marca.

### Los dos departamentos

La tienda está partida en dos mundos, como dice el nombre — **VITA** de vitaminas y suplementos, **TECH** de tecnología:

- **Tecnología** — laptops, celulares, audio, accesorios.
- **Salud y Bienestar** — suplementos, vitaminas, proteínas.

**Cada categoría pertenece a un departamento, y eso decide en qué mitad de la tienda aparecen sus productos.** Un cliente que entra a "Salud y Bienestar" no ve laptops de por medio: ni en el listado, ni en los filtros de marca, ni al buscar.

Las marcas **no** tienen departamento a propósito: una misma marca podría venderte de todo.

> **Para agregar más categorías de suplementos** (Vitaminas, Proteínas, Colágeno, lo que sea): escribe el nombre, elige **Salud y Bienestar** en el desplegable, y listo. Aparece sola en el menú de la tienda en cuanto le subas el primer producto.

> Un departamento **sin productos no se muestra** en la tienda. Es a propósito: mejor que no exista a que el cliente entre y encuentre una sección vacía. En cuanto subas el primer suplemento, "Salud y Bienestar" aparece solo en el menú y en la portada.

---

## 8. Portada: textos y carrusel de diseños

En el menú del panel, dale clic a **"Portada"**. Tiene dos partes.

### Textos
El título grande, la etiqueta de temporada y el texto de abajo. Cámbialos para anunciar una promoción o un descuento.

### Carrusel de diseños
Son las imágenes grandes que se ven debajo del texto, a todo lo ancho de la página.

1. En **"Agregar un diseño"**, elige la imagen (JPG, PNG, WEBP o GIF, máximo 5 MB).
2. **A dónde lleva** (opcional): elige de la lista a qué **producto** o **categoría** quieres mandar al cliente cuando haga clic en la imagen. También puedes elegir "Todo el catálogo". Si lo dejas en "Sin enlace", la imagen no es clicable.
3. **Descripción** (opcional): se lee en voz alta para personas con discapacidad visual y aparece si la imagen no carga.
4. Dale a **"Agregar al carrusel"**.

**Sobre el orden:** las flechas ↑ ↓ mueven cada diseño. **El primero de la lista es el que ve el cliente al entrar.**

**Cambiar el destino después:** cada diseño de la lista tiene su propio desplegable "A dónde lleva". Cámbialo cuando quieras — se guarda solo y aparece una palomita verde al confirmarse. No necesitas volver a subir la imagen.

> Solo aparecen en la lista los productos **visibles**. Si ocultas un producto que era el destino de un diseño, el desplegable te lo va a marcar como no disponible para que elijas otro.

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

Desde agosto de 2026 la tienda guarda una copia lista del catálogo para no consultar la base de datos en cada visita (por eso ahora carga mucho más rápido). Esa copia se descarta sola en el momento en que guardas algo en el panel, así que no cambia nada para ti: sigue siendo guardar y listo.

**¿Dónde está el botón de WhatsApp?**
Hay dos, y los dos le escriben solos el mensaje al cliente:

- El **botón flotante**, abajo a la derecha en todas las páginas. Te llega un "quisiera información sobre sus productos".
- El de **"Preguntar por WhatsApp"** en la ficha de cada producto, debajo de "Agregar al carrito". Ese te llega con el nombre del producto, el precio y el enlace ya escritos, así no tienes que adivinar de qué te están hablando.

Ambos van al **+502 5335-3561**. Si algún día cambias de número, se cambia en un solo lugar del código y se actualiza en toda la tienda — pídemelo y lo hago.

Los clics se cuentan como conversión en Google Analytics y en el Meta Pixel (aparecen como *generate_lead* y *Contact*), para que puedas ver cuánta venta te trae el chat y no solo el carrito.

**¿Los clientes que compran sin cuenta reciben algún comprobante?**
Sí, desde agosto de 2026. En cuanto Recurrente confirma el pago, le llega un correo de confirmación con Vito, el resumen de lo que compró y el total — es su único comprobante nuestro, aparte del recibo que manda Recurrente, porque no tiene "Mi cuenta" donde ver su historial. A un cliente que sí tiene cuenta no le llega este correo porque ya ve su pedido ahí.

Si un cliente dice que no le llegó, revisa spam primero; si de verdad falló el envío, queda registrado en los logs del servidor (`wrangler tail`), avísame y lo reviso.

**¿Por qué el catálogo ahora tiene números de página abajo?**
Desde agosto de 2026 el catálogo se reparte en tandas de 24 productos. Con lo que tienes hoy no se nota (caben todos en una sola página), pero cuando subas más productos, esos números aparecerán solos — no hay nada que configurar.

**¿Qué es "También te puede interesar" en la ficha de producto?**
Muestra hasta 4 productos de la misma categoría, para que el cliente siga viendo cosas después de leer una ficha. Se arma solo a partir de las categorías que ya tienes — no hay que elegir nada a mano.

**¿Y la barra que dice "Te faltan Q X para envío gratis" en el carrito?**
Usa el mismo monto de envío gratis que ya manejabas (Q 299). Si algún día cambias ese monto, avísame y lo actualizo — se usa en un solo lugar del código, así que se actualiza en toda la tienda a la vez.
