export interface Ecommerce_Item {
  id: number;
  item_id: number;
  ecommerce_id: number;
  name: string;
  created: string | Date;
  updated: string | Date;
  category_name: string | null;
  price: number;
  category_id: number | null;
}


