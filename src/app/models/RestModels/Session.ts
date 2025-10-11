export interface Session {
  id: string;
  user_id: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  created: string | Date;
  updated: string | Date | null;
}


