export type TTimeOffs = {
  id: string;
  requestId: number;
  driver: string;
  phone: string
  from: string;
  to: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  adminNote?: string;
  approvedBy?: string;
  rejectedBy?: string
  createdAt: string;
  updatedAt: string;
};
