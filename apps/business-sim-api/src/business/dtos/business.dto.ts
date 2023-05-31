export class BusinessDto {
  id: string;
  name: string;
  price: number;
  location: string;
  cashFlow?: number;
  revenue?: number;
  rent?: number;
  ebitda?: number;
  ffe: Inventory;
  established?: number;
  inventory: Inventory;
  employees?: number;
  absentee: boolean;
}

export interface Inventory {
  value?: number;
  included: boolean;
}
