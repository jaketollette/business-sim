import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, skip, takeUntil } from 'rxjs';
import { Business } from './interfaces/business.interface';
import { Loan } from './interfaces/loan.interface';
import { TurnService } from './services/turn.service';
import { TransactionStore } from './store/transaction.store';

@Component({
  selector: 'business-sim-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'business-sim';

  businesses$!: Observable<Business[]>;
  capital$: Observable<number> = this.store.capital$;
  ownedBusinesses$: Observable<Business[]> = this.store.businesses$;
  loans$: Observable<Loan[]> = this.store.loans$;
  ownedBusinesses: Business[] = [];
  loans: Loan[] = [];
  turn = 0;
  capital = 0;
  monthlyIncome = 0;
  annualIncome = 0;

  destroy$: Subject<void> = new Subject<void>;

  constructor(
    private readonly store: TransactionStore,
    private readonly turnService: TurnService
  ) {
  }

  ngOnInit(): void {
    this.store.fetchAllBusinesses();
    this.businesses$ = this.store.allBusinesses$;

    this.store.businesses$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (businesses) => {
        this.ownedBusinesses = businesses;
      }
    });
    this.store.loans$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (loans) => this.loans = loans
    });
    this.store.capital$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (capital) => {
        this.capital = capital;
        const total = this.calculateMonthlyIncome(this.ownedBusinesses);
        this.monthlyIncome = total;
        this.annualIncome = total * 12;
      }
    });

    this.store.allBusinesses$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (businesses) => {
        this.calculateMonthlyIncome(this.ownedBusinesses);
        // if (!businesses.length) {
        //   this.store.fetchAllBusinesses();
        // }
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateMonthlyIncome(business: Business[]): number {
    const total = business.reduce((prev, current) => {
      if (current.loan) {
        return prev + ((current.cashFlow / 12) - current.loan.payment)
      }
      return prev + (current.cashFlow / 12)
    }, 0);

    return total;
  }

  public calculateCashflow(business: Business, annual = false): number {
    if (annual) {
      if (business.loan) {
        return business.cashFlow - (business.loan.payment * 12)
      }
      return business.cashFlow;
    }
    if (business.loan) {
      return (business.cashFlow / 12) - business.loan.payment;
    }

    return business.cashFlow / 12;
  }

  advance(turns = 1): void {
    for (let i = 0; i < turns; i++) {
      this.turn++;
      this.turnService.advance(this.loans, this.ownedBusinesses);
    }
  }

  sell(business: Business): void {
    this.store.sellBusiness(business);
  }

  loanPayoff(loan: Loan): void {
    const cost = loan.payment * loan.terms;
    const canPay = this.capital > cost;
    if (canPay) {
      this.store.increaseCapital(-1 * cost);
      this.store.removeLoan(loan);
    }
  }
}
