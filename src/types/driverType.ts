export type TTimeOffStatus =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";
export type TTimeOffs = {
  id: string;
  requestId: number;
  driver: string;
  phone: string;
  from: string;
  to: string;
  reason: string;
  status: TTimeOffStatus;
  adminNote?: string;
  approvedBy?: string;
  rejectedBy?: string;
  createdAt: string;
  updatedAt: string;
};
