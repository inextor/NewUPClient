export interface Transaction {
  id: number;
  account: number;
  qty: number;
  movement_qty: number;
  movement_type: 'NEGATIVE' | 'POSITIVE';
  created: string | Date;
  updated: string | Date | null;
  order_id: number;
}


