export interface Account_Period_Summary {
  id: number;
  account_id: number;
  user_id: number;
  category_id: number;
  period_start_date: string;
  period_end_date: string;
  period_type: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'Type of period';
  opening_balance: number;
  total_positive: number;
  total_negative: number;
  closing_balance: number;
  transaction_count: number;
  quota_limit: number | null;
  quota_used_percentage: number | null;
  created: string | Date;
  updated: string | Date;
}


