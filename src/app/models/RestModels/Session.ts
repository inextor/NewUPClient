export interface Session {
  id: number;
  bearer_uuid: any;
  user_id: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  created: string | Date;
  updated: string | Date | null;
}


