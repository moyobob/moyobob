import { Component, OnInit } from '@angular/core';
import {User} from "../types/user";
import {UserService} from "../services/user.service";
import {PaymentService} from "../services/payment.service";
import {Payment} from "../types/payment";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  user: User;
  payments: Payment[];
  collections: Payment[];
  shouldPayList: [number, number][]; // receiverId, totalCost
  bePaidList: [number, number][]; // senderId, totalCost

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
  ) { }

  ngOnInit() {
    this.makeShouldPayList();
    this.makeBePaidList();
  }

  makeShouldPayList(): void {
    this.paymentService.getPayments().then(payments => this.payments = payments);

    for(const item of this.payments) {
      const updateTarget = this.shouldPayList.filter(x => x[0] === item.paidUserId);
      if(updateTarget.length) {
        updateTarget[0][1] += item.price;
      } else {
        this.shouldPayList.push([item.paidUserId, item.price]);
      }
    }
  }

  makeBePaidList(): void {
    this.paymentService.getCollections().then(collections => this.collections = collections);

    for(const item of this.collections) {
      const updateTarget = this.bePaidList.filter(x => x[0] === item.userId);
      if(updateTarget.length) {
        updateTarget[0][1] += item.price;
      } else {
        this.bePaidList.push([item.userId, item.price]);
      }
    }
  }

  getUserNameById(Id: number): string {
    return 'NAME';
  }

  getMeansById(Id: number): string {
    return 'ACCOUNTS';
  }

  resolve(senderId: number): void {
    this.paymentService.resolvePayment(senderId).then(_ => {
      location.reload();
    });
  }
}
