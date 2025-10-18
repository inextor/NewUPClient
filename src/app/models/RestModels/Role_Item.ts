export interface Role_Item {
  id: number;
  item_id: number;
  role_id: number;
  created: string | Date;
  updated: string | Date;
  quota: number;
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'unlimited' | 'Quota renewal period';
  period_quantity: number;
}


