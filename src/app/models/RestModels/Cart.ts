export interface Cart {
  id: number;
  user_id: number;
  qty: number;
  ecommerce_item: number;
  variation: 'calzado' | 'camisa' | 'pantalon caballero' | 'pantalon dama' | 'unico' | null;
}


