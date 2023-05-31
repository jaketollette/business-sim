import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { BusinessComponent } from './business/business.component';
import { LoanService } from './loan/services/loan.service';
import { TurnService } from './services/turn.service';
import { TransactionStore } from './store/transaction.store';

@NgModule({
  declarations: [AppComponent, BusinessComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [HttpClient, TransactionStore, TurnService, LoanService],
  bootstrap: [AppComponent],
})
export class AppModule { }
