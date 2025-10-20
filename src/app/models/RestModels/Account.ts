export interface Account {
  id: number;
  user_id: number;
  category_id: number;
  period_amount: number;
  period_type: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'dia, semana, mes, año';
  start_date: string;
  period_end: string | null;
  created: string | Date;
  updated: string | Date;
}
