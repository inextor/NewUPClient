export interface User {
  id: number;
  type: 'USER' | 'ADMIN';
  ecommerce_id: number;
  name: string;
  username: string | null;
  password: string | null;
  created: string | Date;
  updated: string | Date;
  code: string | null;
}


