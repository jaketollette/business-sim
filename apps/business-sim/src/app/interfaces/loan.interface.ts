import { Business } from "./business.interface";

export interface Loan {
  amount: number;
  terms: number;
  interestRate: number;
  payment: number;
  balance: number;
  business: Business;
}

export interface LoanRequest {
  amount: number;
  downPayment: number;
  business: Business;
}

export interface LoanPayment {
  amount: number;
  loan: Loan;
}
