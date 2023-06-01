import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, Subject, skip, takeUntil } from 'rxjs';
import { Business } from './interfaces/business.interface';
import { LoanScheduleDialogComponent } from './loan/components/loan-schedule-dialog/loan-schedule-dialog.component';
import { Loan } from './loan/interfaces/loan.interface';
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
  managers = 0;

  destroy$: Subject<void> = new Subject<void>;

  constructor(
    private readonly store: TransactionStore,
    private readonly turnService: TurnService,
    private readonly dialog: DialogService,
    private readonly confirmationService: ConfirmationService,
    private readonly currencyPipe: CurrencyPipe
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

    this.store.managers$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (managers) => this.managers = managers
    })

    this.store.allBusinesses$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.calculateMonthlyIncome(this.ownedBusinesses);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateMonthlyIncome(business: Business[]): number {
    const total = business.reduce((prev, current) => {
      if (current.loan?.payments?.length) {
        return prev + ((current.cashFlow / 12) - current.loan?.payments[0].totalPayment)
      }
      return prev + (current.cashFlow / 12)
    }, 0);

    return total;
  }

  public calculateCashflow(business: Business, annual = false): number {
    if (annual) {
      if (business.loan?.payments?.length) {
        return business.cashFlow - (business.loan.payments[0].totalPayment * 12)
      }
      return business.cashFlow;
    }
    if (business.loan?.payments?.length) {
      return (business.cashFlow / 12) - business.loan.payments[0].totalPayment;
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
    const salePrice = business.cashFlow * 1.25;
    const message = `Are you sure you want to sell this business for ${this.currencyPipe.transform(salePrice)}?`;
    this.confirmationService.confirm({
      message,
      header: 'Please Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.sellBusiness(business)
    });
  }

  loanPayoff(loan: Loan): void {
    const cost = loan.payments[0].principalRemaining + loan.payments[0].interestPayment;
    const canPay = this.capital > cost;
    if (canPay) {
      this.confirmationService.confirm({
        message: `Pay ${this.currencyPipe.transform(cost)} to close loan?`,
        header: 'Loan Payoff',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.store.increaseCapital(-1 * cost);
          this.store.removeLoan(loan);
        }
      })
    }
  }

  hireManager(): void {
    this.store.hireManager();
  }

  viewSchedule(business: Business): void {
    this.dialog.open(LoanScheduleDialogComponent, {
      header: 'Schedule',
      data: {
        business
      }
    })
  }
}
