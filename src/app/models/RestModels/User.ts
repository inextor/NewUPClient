export interface User {
  id: number;
  type: 'USER' | 'ADMIN';
  ecommerce_id: number;
  name: string;
  password: string | null;
  created: number;
  updated: number;
  code: string | null;
}


