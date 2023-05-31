import { Injectable } from "@angular/core";
import { Loan } from "../interfaces/loan.interface";
import { CalculatorService } from "./calculator.service";

const DEFAULT_LOAN: Loan = {
  amount: 0,
  downPayment: 0,
  interest: 0,
  years: 0,
  paymentsPerYear: 12,
  monthlyPayment: 0,
  payments: [],
  total: {
    interest: 0,
    principal: 0,
    total: 0
  },
  business: undefined
}
@Injectable({
  providedIn: 'root'
})
export class LoanService {
  constructor(private readonly calculator: CalculatorService) { }

  createLoan(request: Partial<Loan>): Loan {
    const loan: Loan = {
      ...DEFAULT_LOAN,
      ...request
    }
    return this.calculator.calculate(loan);

  }
}
