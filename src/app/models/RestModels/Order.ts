export interface Order {
  id: number;
  ecommerce_id: number;
  order_number: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  pos_order_id: number | null;
  pos_order_json: any | null;
  order_date: string | Date;
  notes: string | null;
  created_by_user_id: number | null;
  created: string | Date;
  updated: string | Date;
}


