export interface Transaction {
  id: number;
  account: number;
  qty: number;
  movement_qty: number;
  movement_type: 'NEGATIVE' | 'POSITIVE';
  created: number;
  updated: number;
  order_id: number;
}


