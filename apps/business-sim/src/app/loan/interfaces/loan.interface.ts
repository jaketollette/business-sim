import { Business } from "../../interfaces/business.interface";

export interface Loan {
  amount: number;
  downPayment: number;
  interest: number;
  years: number;
  paymentsPerYear: number;
  total: LoanPaymentTotal;
  payments: LoanPayment[];
  monthlyPayment: number;
  business?: Business
}

export interface LoanPayment {
  id: number;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  principalRemaining: number;
  interestCumulative: number;
}

export interface LoanPaymentTotal {
  interest: number;
  principal: number;
  total: number;
}


export interface NewLoanDialogConfig {
  business: Business;
  currentCapital: number;
  totalAmount: number;
}

export interface LoanScheduleDialogConfig {
  business: Business;
}
