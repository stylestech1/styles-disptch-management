export type TUserRole = "admin" | "employee";
export type TStatusLoad = "pending" | "in_transit" | "delivered" | "cancelled";
export type TStatusDriver = "inactive" | "available" | "busy";
export type TTruckType = 'reefer' | 'van'
export type TTruckId = {
  model: string;
  truckId: number;
  plateNumber: string;
};
export type TLoads = {
  id?: string;
  loadId: string;
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
  truckType: TTruckType
  truckTemp: number
  comments: TComments[]
  feesNumber: string
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
  pricePerMile: number
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
  type: TTruckType
};
export type TPagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
  next?: number;
  prev?: number;
};
export type TComments = {
  id: string
  load: TLoads
  driver: TDriver
  truck: TTruck
  text: string
  addedBy: {_id: string; name: string; jobId: number}
  _id: string
  createdAt: string
  updatedAt: string
  type: 'disptacher' | 'driver'
}
export type TErrors = {
  type: 'field'
  value: string
  msg: string
  path: string
  location: string
  message?: string
}
export type TDispatcher = {
  id: string;
  name: string;
  active: boolean;
  email: string;
  phone: string;
  role: string;
  position: string;
  jobId: number;
};