import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { Observable, map, switchMap } from "rxjs";
import { v4 as uuidv4 } from 'uuid';
import { Business } from "../interfaces/business.interface";
import { Loan, LoanPayment, LoanRequest } from "../interfaces/loan.interface";

interface TransactionState {
  capital: number;
  loans: Loan[];
  businesses: Business[];
  allBusinesses: Business[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionStore extends ComponentStore<TransactionState> {
  public readonly capital$ = this.select(s => s.capital);
  public readonly loans$ = this.select(s => s.loans);
  public readonly businesses$ = this.select(s => s.businesses);
  public readonly allBusinesses$ = this.select(s => s.allBusinesses);

  public readonly fetchAllBusinesses = this.effect((_: Observable<void>) =>
    _.pipe(
      switchMap(() => this.http.get<Business[]>('api/business').pipe(
        map(businesses => businesses.sort((a, b) => a.price > b.price ? -1 : 1).map(b => {
          b.id = b.id = uuidv4();
          return b;
        }))
      )),
      tapResponse(
        (businesses: Business[]) => {
          this.updateAllBusinesses(businesses)
        },
        (err) => console.error(err)
      )
    ));

  public readonly getLoan = this.effect((amount: Observable<LoanRequest>) =>
    amount.pipe(
      tapResponse(
        (loan) => {
          const currentLoans = this.get().loans;
          const business = { ...loan.business }
          const newLoan = {
            amount: loan.amount,
            balance: loan.amount,
            interestRate: 7.75,
            payment: (((loan.amount + (loan.amount * 0.440128)) / 10) / 12),
            terms: (10 * 12),
            business
          }
          currentLoans.push(newLoan);
          let currentCapital = this.get().capital;
          currentCapital += (loan.amount);
          currentCapital -= (loan.downPayment);
          this.updateCapital(currentCapital);
          this.updateLoans(currentLoans);
          const updatedBusiness = {
            ...loan.business,
            loan: newLoan
          }
          this.buyBusiness(updatedBusiness);
        },
        (err) => console.error(err)
      )
    ));

  public readonly buyBusiness = this.effect((business: Observable<Business>) =>
    business.pipe(
      map(business => business),
      tapResponse(
        (business) => {
          const currentBusinesses = this.get().businesses;
          if (currentBusinesses.length < 10) {
            currentBusinesses.push(business);
            const allBusinesses = this.get().allBusinesses;
            const filteredBusinesses = allBusinesses.filter(b => b.id !== business.id);
            const currentCapital = this.get().capital;
            let newCapital = currentCapital - business.price;
            if (business.inventory.value && !business.inventory.included) {
              newCapital -= business.inventory.value;
            }
            if (business.ffe.value && !business.ffe.included) {
              newCapital -= business.ffe.value;
            }
            this.updateAllBusinesses(filteredBusinesses);
            this.updateCapital(newCapital);
            this.updateBusinesses(currentBusinesses);
          }
        },
        (err) => console.error(err)
      )
    ));

  public readonly sellBusiness = this.effect((business: Observable<Business>) =>
    business.pipe(
      tapResponse(
        (business) => {
          const currentBusinesses = this.get().businesses;
          this.updateBusinesses(currentBusinesses.filter(b => b.id !== business.id));
          this.increaseCapital(business.cashFlow * 2.25);
        },
        (err) => console.error(err)
      )
    ))

  public readonly increaseCapital = this.effect((amount: Observable<number>) =>
    amount.pipe(
      tapResponse(
        (amount) => {
          let currentCapital = this.get().capital;
          currentCapital += amount;
          console.log('amount and capital', amount, currentCapital);
          this.updateCapital(currentCapital);
        },
        (err) => console.error(err)
      )
    ));

  public readonly payLoans = this.effect((payment: Observable<LoanPayment>) =>
    payment.pipe(
      tapResponse(
        (payment: LoanPayment) => {
          const loans = this.get().loans;
          const loanToPay = loans.find(l => l.business.id === payment.loan.business.id);
          if (loanToPay) {
            const updateLoans = loans.filter(loan => loan.terms > 0).map(l => {
              if (l.business.id === payment.loan.business.id) {
                //update balance
                l.balance -= payment.amount;
                l.terms -= 1;
              }
              return l
            });
            this.updateLoans(updateLoans);
          }
        },
        (err) => console.error(err)
      )
    ));

  public readonly removeLoan = this.effect((loan: Observable<Loan>) =>
    loan.pipe(
      tapResponse(
        (loan: Loan) => {
          const currentLoans = this.get().loans;
          const currentBusinesses = this.get().businesses;
          const filtered = currentLoans.filter(existing => loan.business.id !== existing.business.id);
          let businessWithLoan = currentBusinesses.find(business => loan.business.id === business.id);
          if (businessWithLoan) {
            const updated = currentBusinesses.filter(business => loan.business.id !== business.id);
            businessWithLoan = { ...businessWithLoan, loan: undefined }
            updated.push(businessWithLoan);
            this.updateBusinesses(updated);
          }
          this.updateLoans(filtered);
        },
        (err) => console.error(err)
      )
    ));

  public readonly updateBusinesses = this.updater((state, businesses: Business[]) => ({
    ...state,
    businesses
  }));

  private readonly updateLoans = this.updater((state, loans: Loan[]) => ({
    ...state,
    loans
  }));

  private readonly updateCapital = this.updater((state, capital: number) => ({
    ...state,
    capital
  }));

  private readonly updateAllBusinesses = this.updater((state, allBusinesses: Business[]) => ({
    ...state,
    allBusinesses
  }));

  constructor(private readonly http: HttpClient) {
    super({
      businesses: [],
      capital: 11000,
      loans: [],
      allBusinesses: []
    })
  }
}
