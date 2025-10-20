export interface Transaction {
  id: number;
  account_id: number;
  qty: number;
  movement_qty: number;
  movement_type: 'NEGATIVE' | 'POSITIVE';
  is_main: number| null;
  created: string | Date;
  updated: string | Date | null;
  order_id: number;
}


