import { Component, Input, OnInit } from '@angular/core';
import { Business } from '../interfaces/business.interface';
import { TransactionStore } from '../store/transaction.store';

@Component({
  selector: 'business-sim-business',
  templateUrl: 'business.component.html',
  styleUrls: ['business.component.scss']
})

export class BusinessComponent implements OnInit {
  @Input() business!: Business;

  showLoanOptions = false;
  neededCapital = 0;
  currentCapital = 0;
  downPayment = 0;
  loanAmount = 0;

  constructor(private readonly store: TransactionStore) { }

  ngOnInit(): void {
    this.store.capital$.subscribe(capital => {
      this.currentCapital = capital;
    });
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
      this.showLoanOptions = true;
      this.neededCapital = Math.abs(this.currentCapital - this.totalPrice());
      this.loanAmount = this.totalPrice();
      this.downPayment = this.loanAmount * 0.1;
    }
  }

  public close(): void {
    this.showLoanOptions = false;
  }

  public takeLoan(): void {
    this.store.getLoan({
      amount: this.loanAmount,
      downPayment: this.downPayment,
      business: this.business
    });
    this.showLoanOptions = false;
  }
}
