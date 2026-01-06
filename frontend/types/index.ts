export type UserRole = "user" | "driver" | "manager" | "superAdmin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Vehicle {
  id: string;
  userId: string;
  vehicleNumber: string;
  vehicleModel: string;
  color: string;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  floor: number;
  status: "available" | "occupied";
  location: string;
}

export interface Parking {
  id: string;
  userId: string;
  vehicleId: string;
  parkingSpotId: string;
  entryTime: Date;
  exitTime?: Date;
  location: string;
  amount: number;
  paymentMethod: "UPI" | "Netbanking" | "Cash" | "Card";
  status: "ongoing" | "completed";
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "UPI" | "Netbanking" | "Cash" | "Card";
  details: string;
}
