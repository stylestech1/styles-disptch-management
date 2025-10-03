export type TUserRole = "admin" | "employee";
export type TStatusLoad = "pending" | "in_transit" | "delivered" | "cancelled";
export type TStatusDriver = "inactive" | "available" | "busy";
export type TTruckId = {
  model: string;
  truckId: number;
  plateNumber: string;
};
export type TLoads = {
  id?: string;
  loadId: number;
  origin: string;
  destination: string;
  distanceMiles: number;
  pricePerMile: number;
  totalPrice: number;
  status: TStatusLoad;
  driverId: TDriver;
  truckId: TTruckId;
  deliveredAt?: string;
  currency: string;
  createdBy: string
  updatedBy?: string
  cancelledAt?: string
};
export type TDriver = {
  id: string;
  driverId: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: TStatusDriver;
  hireDate: string;
  createdBy: string;
};
export type TTruck = {
  id: string;
  truckId: number;
  plateNumber: string;
  model: string;
  year: number;
  capacity: number;
  status: TStatusDriver;
  createdBy: string;
  updatedBy: string;
  assignedDriver: {name: string; driverId: number}
};
export type TPagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
  next?: number;
  prev?: number;
};