export interface Order {
  id: number;
  ecommerce_id: number;
  user_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  items_count: number;
  order_number: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  pos_order_id: number | null;
  pos_order_json: any | null;
  order_date: string | Date;
  notes: string | null;
  updated_by_user_id: number | null;
  created_by_user_id: number | null;
  created: string | Date;
  updated: string | Date;
}


