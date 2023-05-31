import { Injectable } from "@angular/core";
import { Business } from "../interfaces/business.interface";
import { Loan } from "../interfaces/loan.interface";
import { TransactionStore } from "../store/transaction.store";

@Injectable({
  providedIn: 'root'
})
export class TurnService {
  constructor(private readonly store: TransactionStore) { }
  advance(loans: Loan[], businesses: Business[]): void {
    this.updateCapital(businesses);
    this.updateLoans(loans);
    this.businessGrowth(businesses);
  }

  private businessGrowth(businesses: Business[], monthly = true): void {
    this.store.updateBusinesses(businesses.map(b => {
      let rate = this.randomPercentage(7, 25);
      if (monthly) {
        rate /= 12;
      }
      b.cashFlow = (b.cashFlow * rate) + b.cashFlow;
      b.revenue = (b.revenue * rate) + b.revenue;
      return b;
    }));
  }

  private updateCapital(businesses: Business[]): void {
    const totalIncome = businesses.reduce((previous, current) => {
      if (current.loan) {
        return previous + ((current.cashFlow / 12) - current.loan.payment)
      }
      return previous + (current.cashFlow / 12)
    }, 0);


    this.store.increaseCapital(totalIncome);
  }

  private updateLoans(loans: Loan[]): void {
    loans.forEach(l => {
      if (l.terms <= 0) {
        this.store.removeLoan(l);
      } else {
        this.store.payLoans({ amount: l.amount, loan: l });
      }
    });
  }

  private randomPercentage(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min) / 100;
  }
}
