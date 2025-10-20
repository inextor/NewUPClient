export interface User_Ecommerce_Item {
  id: number;
  user_id: number;
  order_id: number | null;
  delivered_timestamp: number | null;
  created: string | Date;
  updated: string | Date;
}


