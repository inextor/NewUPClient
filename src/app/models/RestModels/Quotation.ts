export interface Quotation
{
	id?: number;
	ecommerce_id?: number;
	nombre?: string;
	correo?: string;
	telefono?: string;
	descripcion?: string;
	cantidad_requerida?: number;
	fecha_entrega_solicitada?: string;
	status?: string;
	created_by_user_id?: number;
	created?: string;
	updated?: string;
}
