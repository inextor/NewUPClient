export interface User_Order_Item {
  id: number;
  order_item_id: number;
  user_id: number;
  qty: number;
  notes: string | null;
  delivered: string | Date | null;
  created: string | Date;
  updated: string | Date;
}


