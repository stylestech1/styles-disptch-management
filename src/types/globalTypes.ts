export type TUserRole = "admin" | "employee";
export type TStatusLoad = "pending" | "in_transit" | "delivered" | "cancelled";
export type TStatusDriver = "inactive" | "available" | "busy";
export type TTruckType = "reefer" | "van";
export type TTruckId = {
  model: string;
  truckId: number;
  plateNumber: string;
};
export type TLoads = {
  id?: string;
  loadId: string;
  origin: string;
  DHO: string;
  destination: string;
  distanceMiles: number;
  pricePerMile: number;
  totalPrice: number;
  status: TStatusLoad;
  driverId: TDriver;
  truckId: TTruckId;
  currency: string;
  createdBy: string;
  updatedBy?: string;
  cancelledAt?: string;
  truckType: TTruckType;
  truckTemp: number;
  comments: TComments[];
  feesNumber: string;
  pickupAt: string;
  completedAt: string;
  arrivalAtShipper?: string; // new
  arrivalAtReceiver?: string; // new
  leftShipper?: string; // new
  leftReceiver?: string; // new
  deliveredAt?: string;
  createdAt?: string; 
  documents?: {viewLink: string; downloadLink: string}[]
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
  pricePerMile: number;
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
  assignedDriver: { name: string; driverId: number };
  type: TTruckType;
  fuelPerMile:number;
  insuranceCost:number;
  repairCost: number;
  summary?: TTruckSummary
};
export interface TruckApiResponse {
  data: TTruck[];
  paginationResult?: TPagination;
  message?: string;
  status?: string;
}
export type TPagination = {
  currentPage: number;
  totalPages: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
};
export type TComments = {
  id: string;
  load: TLoads;
  driver: TDriver;
  truck: TTruck;
  text: string;
  addedBy: { _id: string; name: string; jobId: number };
  _id: string;
  createdAt: string;
  updatedAt: string;
  type: "dispatcher" | "driver";
};
export type CommentsResponse = {
  message: string;
  loadId: string;
  comments: TComments[];
};
export type TErrors = {
  type: "field";
  value: string;
  msg: string;
  path: string;
  location: string;
  message?: string;
};
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

export type TPeriod = {
  from: string;
  to: string;
};

export type TLoadSummary = {
  id: string;
  totalLoads: number;
  totalMiles: number;
  totalEarnings: number;
  pricePerMile: number;
  currency: string;
  period: TPeriod;
  loads: TLoads[];
};
 export type TTruckSummary = {
  truckId: number;
  summary: {
    totalLoads: number;
    totalMiles: number;
    totalRevenue: number;
    fuelCost: number;
    repairCost: number;
    insuranceCost: number;
    driverPay: number;
    netProfit: number;
    avgRevenuePerMile: number;
    avgExpensePerMile: number;
    currency: string;
  };
  loads: TLoads,
  period: TPeriod
}


