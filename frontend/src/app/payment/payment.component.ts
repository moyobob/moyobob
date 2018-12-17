import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../types/payment';
import { UserService } from '../services/user.service';
import { RestaurantService } from '../services/restaurant.service';
import { User } from "../types/user";
import { Menu } from "../types/menu";

class PaymentInfo {
  payment: Payment;
  paidUser: User;
  user: User;
  menu: Menu;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  // payments: Payment[];
  // collections: Payment[];
  paymentsPromise: Promise<PaymentInfo>[];
  collectionsPromise: Promise<PaymentInfo>[];

  constructor(
    private userService: UserService,
    private restaurantService: RestaurantService,
    private paymentService: PaymentService,
  ) { }

  ngOnInit() {
    this.paymentService.getPayments().then(payments => {
      this.paymentsPromise = payments.map(payment => {
        return this.userService.getUser(payment.userId).then(async u => {
          const pu = await this.userService.getUser(payment.paidUserId);
          const m = await this.restaurantService.getMenu(payment.menuId);
          return {
            payment: payment,
            paidUser: pu,
            user: u,
            menu: m,
          };
        });
      })
    });
    this.paymentService.getCollections().then(payments => {
      this.collectionsPromise = payments.map(payment => {
        return this.userService.getUser(payment.userId).then(async u => {
          const pu = await this.userService.getUser(payment.paidUserId);
          const m = await this.restaurantService.getMenu(payment.menuId);
          return {
            payment: payment,
            paidUser: pu,
            user: u,
            menu: m,
          };
        });
      })
    });
    // this.paymentService.getPayments().then(payments => {
    //   this.payments = payments;
    //   this.paymentsPromise = [];
    //   payments.forEach(payment => {
    //     const paymentPromise = {
    //       paymentId: payment.id,
    //       toUser: this.getUserNameById(payment.paidUserId),
    //       price: payment.price,
    //       // partyName: this.getNameByPartyRecordId(payment.partyRecordId),
    //       // when: this.getWhenByPartyRecordId(payment.partyRecordId),
    //       menuName: this.getMenuNameById(payment.menuId),
    //     };
    //     this.paymentsPromise.push(paymentPromise);
    //   });
    // });
    // this.paymentService.getCollections().then(collections => {
    //   this.collections = collections;
    //   this.collectionsPromise = [];
    //   collections.forEach(collection => {
    //     const collectionPromise = {
    //       collectionId: collection.id,
    //       byUser: this.getUserNameById(collection.userId),
    //       price: collection.price,
    //       // partyName: this.getNameByPartyRecordId(collection.partyRecordId),
    //       // when: this.getWhenByPartyRecordId(collection.partyRecordId),
    //       menuName: this.getMenuNameById(collection.menuId),
    //     };
    //     this.collectionsPromise.push(collectionPromise);
    //   })
    // });

  }

  async getUserNameById(Id: number): Promise<string> {
    const user = await this.userService.getUser(Id);
    return user.username;
  }

  async getMenuNameById(id: number): Promise<string> {
    const menu = await this.restaurantService.getMenu(id);
    return menu.name;
  }

  async getNameByPartyRecordId(id: number): Promise<string> {
    const partyRecord = await this.paymentService.getPartyRecord(id);
    return partyRecord.name;
  }

  async getWhenByPartyRecordId(id: number): Promise<string> {
    const partyRecord = await this.paymentService.getPartyRecord(id);
    return partyRecord.since;
  }

  resolve(paymentId: number): void {
    this.paymentService.resolvePayment(paymentId).then(_ => {
      this.collections = this.collections.filter(p => p.id !== paymentId);
    });
  }
}
