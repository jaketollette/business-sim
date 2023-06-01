import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { Business } from '../interfaces/business.interface';
import { NewLoanDialogComponent } from '../loan/components/new-loan-dialog/new-loan-dialog.component';
import { TransactionStore } from '../store/transaction.store';

@Component({
  selector: 'business-sim-business',
  templateUrl: 'business.component.html',
  styleUrls: ['business.component.scss']
})

export class BusinessComponent implements OnInit, OnDestroy {
  @Input() business!: Business;

  currentCapital = 0;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly store: TransactionStore,
    private readonly dialog: DialogService,
  ) { }

  ngOnInit(): void {
    this.store.capital$.subscribe(capital => {
      this.currentCapital = capital;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public totalPrice(): number {
    let price = this.business.price;
    if (this.business.inventory.value && !this.business.inventory.included) {
      price += this.business.inventory.value;
    }

    if (this.business.ffe.value && !this.business.ffe.included) {
      price += this.business.ffe.value
    }

    return price;
  }

  public buy(): void {
    if (this.currentCapital >= this.totalPrice()) {
      this.store.buyBusiness(this.business);
    } else {
      this.dialog.open(NewLoanDialogComponent, {
        header: 'Loan Options',
        draggable: true,
        resizable: true,
        data: {
          business: this.business,
          currentCapital: this.currentCapital,
          totalAmount: this.totalPrice()
        }
      });
    }
  }
}
