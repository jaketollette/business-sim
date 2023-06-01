import { Component } from "@angular/core";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { Business } from "../../../interfaces/business.interface";
import { Loan, LoanScheduleDialogConfig } from "../../interfaces/loan.interface";

@Component({
  templateUrl: 'loan-schedule-dialog.component.html'
})
export class LoanScheduleDialogComponent {
  business: Business;
  loan: Loan;

  constructor(
    config: DynamicDialogConfig<LoanScheduleDialogConfig>
  ) {
    this.business = config.data?.business as Business;
    this.loan = this.business.loan as Loan;
  }
}
