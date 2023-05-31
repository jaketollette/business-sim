import { Loan } from "../loan/interfaces/loan.interface";

export interface Business {
  id: string;
  name: string;
  price: number;
  location: string;
  cashFlow: number;
  revenue: number;
  rent: number;
  ebitda: number;
  ffe: Inventory;
  established: number;
  inventory: Inventory;
  employees: number;
  absentee: boolean;
  loan?: Loan;
}

export interface Inventory {
  value: number;
  included: boolean;
}
