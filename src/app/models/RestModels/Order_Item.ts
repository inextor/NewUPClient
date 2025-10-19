export interface Order_Item {
  id: number;
  order_id: number;
  ecommerce_item_id: number;
  quantity: number;
  unit_price: number | null;
  notes: string | null;
  created: string | Date;
  updated: string | Date;
}


