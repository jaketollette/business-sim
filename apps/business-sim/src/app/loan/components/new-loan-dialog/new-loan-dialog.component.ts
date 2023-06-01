import { Component } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Business } from "../../../interfaces/business.interface";
import { TransactionStore } from "../../../store/transaction.store";
import { NewLoanDialogConfig } from "../../interfaces/loan.interface";

const SBA_MAX_LOAN = 5_000_000;
const SBA_MIN_DOWN = 0.1;

@Component({
  templateUrl: 'new-loan-dialog.component.html'
})
export class NewLoanDialogComponent {
  neededCapital: number;
  loanAmount: number;
  downPayment: number;
  currentCapital: number;
  loanEligable: boolean;
  business: Business;
  canAccept: boolean;

  constructor(
    private readonly store: TransactionStore,
    private readonly dialogRef: DynamicDialogRef,
    config: DynamicDialogConfig<NewLoanDialogConfig>
  ) {
    this.neededCapital = Number(config.data?.business.price) - Number(config.data?.currentCapital);
    this.currentCapital = Number(config.data?.currentCapital);
    this.loanAmount = Number(config.data?.totalAmount);
    this.downPayment = this.loanAmount * SBA_MIN_DOWN;
    this.loanEligable = this.neededCapital < SBA_MAX_LOAN;
    this.business = config.data?.business as Business;
    this.canAccept = this.currentCapital >= this.downPayment && this.loanEligable;
  }

  public close(): void {
    this.dialogRef.destroy();
  }

  public accept(): void {
    this.store.getLoan({
      amount: this.loanAmount,
      downPayment: this.downPayment,
      business: this.business,
    });

    this.close();
  }
}
