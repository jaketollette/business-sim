import { Injectable } from "@angular/core";
import toFixed from "../../shared/functions";
import { Loan, LoanPayment, LoanPaymentTotal } from "../interfaces/loan.interface";

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  public calculate(loan: Loan): Loan {
    loan.payments = this.calculatePayments(loan);
    loan.total = this.calculatePaymentTotal(loan);
    loan.monthlyPayment = this.getMonthlyPayment(loan.payments);
    return loan;
  }

  public calculateprincipal(
    monthlyPayment: number,
    interest: number,
    years: number,
    paymentsPerYear: number
  ): number {
    // M = P[r(1+r)^n/((1+r)^n)-1)]

    const n: number = years * paymentsPerYear;
    const r: number = interest / 100 / paymentsPerYear;
    const powerI: number = Math.pow(1 + r, n);

    return toFixed((monthlyPayment * (powerI - 1)) / (r * powerI), 2);
  }

  private calculatePaymentTotal(loan: Loan): LoanPaymentTotal {
    const principal = loan.amount - loan.downPayment;
    const total = this.calculateTotal(loan);
    const interest = toFixed(total - principal, 2);

    return {
      interest,
      principal,
      total
    }
  }

  private getMonthlyPayment(payments: LoanPayment[]): number {
    if (payments.length < 1) {
      throw new Error('payments are empty');
    }

    const firstEl = payments[0];

    if (firstEl.totalPayment === undefined || firstEl.totalPayment === null) {
      throw new Error('invalid payment object');
    }

    return firstEl.totalPayment;
  }

  private calculateTotal(loan: Loan) {
    return toFixed(loan.payments.reduce((prev, curr) => prev + curr.totalPayment, 0), 2)
  }

  private calculatePayments(loan: Loan): LoanPayment[] {
    const result: LoanPayment[] = [];
    let currentprincipal = loan.amount - loan.downPayment;
    const totalPaymentPerPeriod = this.totalPaymentPerPeriod(loan);
    let interestCumulative = 0;

    for (let i = 0; i < loan.years * loan.paymentsPerYear; i++) {
      const interestPaymentPerPeriod = this.interestPaymentPerPeriod(
        loan,
        currentprincipal
      );
      interestCumulative += interestPaymentPerPeriod;
      interestCumulative = toFixed(interestCumulative, 2)
      const principalPaid = toFixed(totalPaymentPerPeriod - interestPaymentPerPeriod, 2);
      currentprincipal -= principalPaid;
      currentprincipal = toFixed(currentprincipal, 2);

      const payment: LoanPayment = {
        id: i + 1,
        totalPayment: totalPaymentPerPeriod,
        principalPayment: principalPaid,
        interestPayment: interestPaymentPerPeriod,
        principalRemaining: currentprincipal,
        interestCumulative
      }

      result.push(payment);
    }

    const lastPayment = result[result.length - 1];
    const rebalancedPayment = this.rebalance(lastPayment);
    result[result.length - 1] = rebalancedPayment;

    return result;
  }

  private totalPaymentPerPeriod(loan: Loan): number {
    const loanAmount = loan.amount - loan.downPayment;
    const rate = this.ratePerPeriod(loan.interest, loan.paymentsPerYear);
    const multiplier = this.interestPowerMultiplier(
      rate,
      loan.paymentsPerYear,
      loan.years
    );

    return toFixed((loanAmount * (rate * multiplier)) / (multiplier - 1), 2);
  }

  private interestPowerMultiplier(
    ratePerPeriod: number,
    paymentsPerYear: number,
    years: number
  ): number {
    return Math.pow(1 + ratePerPeriod, paymentsPerYear * years);
  }

  private ratePerPeriod(interestRate: number, paymentsPerYear: number): number {
    return interestRate / paymentsPerYear / 100;
  }

  private interestPaymentPerPeriod(loan: Loan, principal: number): number {
    const amount = principal * (loan.interest / loan.paymentsPerYear / 100);
    return toFixed(amount, 2);
  }

  private rebalance(payment: LoanPayment): LoanPayment {
    if (payment.principalRemaining >= 0) {
      return payment;
    }

    payment.totalPayment += payment.principalRemaining;
    payment.totalPayment = toFixed(payment.totalPayment, 2);
    payment.principalPayment += payment.principalRemaining;
    payment.principalPayment = toFixed(payment.principalPayment, 2);

    payment.principalRemaining = 0;

    return payment;
  }
}
