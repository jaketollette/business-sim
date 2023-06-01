import { Injectable } from "@angular/core";
import { Business } from "../interfaces/business.interface";
import { Loan } from "../loan/interfaces/loan.interface";
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
      let profit = b.cashFlow;
      let rate = this.randomPercentage(7, 25);
      if (monthly) {
        rate /= 12;
        profit = b.cashFlow / 12;
        b.monthsOwned++
      }
      b.cashFlow = (b.cashFlow * rate) + b.cashFlow;
      b.revenue = (b.revenue * rate) + b.revenue;
      b.totalProfit += profit;
      return b;
    }));
  }

  private updateCapital(businesses: Business[]): void {
    const totalIncome = businesses.reduce((previous, current) => {
      if (current.loan?.payments?.length) {
        return previous + ((current.cashFlow / 12) - current.loan?.payments[0].totalPayment)
      }
      return previous + (current.cashFlow / 12)
    }, 0);


    this.store.increaseCapital(totalIncome);
  }

  private updateLoans(loans: Loan[]): void {
    loans.forEach(l => {
      if (l.years <= 0) {
        this.store.removeLoan(l);
      } else {
        this.store.payLoans(l);
      }
    });
  }

  private randomPercentage(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min) / 100;
  }
}
