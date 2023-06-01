import { CurrencyPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { BusinessComponent } from './business/business.component';
import { LoanScheduleDialogComponent } from './loan/components/loan-schedule-dialog/loan-schedule-dialog.component';
import { NewLoanDialogComponent } from './loan/components/new-loan-dialog/new-loan-dialog.component';
import { LoanService } from './loan/services/loan.service';
import { TurnService } from './services/turn.service';
import { TransactionStore } from './store/transaction.store';

@NgModule({
  declarations: [
    AppComponent,
    BusinessComponent,
    NewLoanDialogComponent,
    LoanScheduleDialogComponent
  ],
  imports: [
    ButtonModule,
    BrowserAnimationsModule,
    DynamicDialogModule,
    FieldsetModule,
    PanelModule,
    ConfirmDialogModule,
    BrowserModule,
    CardModule,
    TableModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [HttpClient, TransactionStore, TurnService, LoanService, DialogService, ConfirmationService, CurrencyPipe],
  bootstrap: [AppComponent],
})
export class AppModule { }
