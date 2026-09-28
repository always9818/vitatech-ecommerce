import { redirect } from "next/navigation";

/**
 * `/admin` a secas daba 404: el panel no tiene portada propia. Se manda a
 * Productos, que es la sección con la que abre el encabezado del panel. El
 * layout ya exige rol ADMIN antes de llegar aquí.
 */
export default function AdminIndex() {
  redirect("/admin/productos");
}
