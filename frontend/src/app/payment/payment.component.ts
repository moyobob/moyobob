import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../types/payment';
import { UserService } from '../services/user.service';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  payments: Payment[] = [];
  collections: Payment[] = [];

  constructor(
    private userService: UserService,
    private restaurantService: RestaurantService,
    private paymentService: PaymentService,
  ) { }

  ngOnInit() {
    this.paymentService.getPayments().then(payments => { this.payments = payments; });
    this.paymentService.getCollections().then(collections => { this.collections = collections; });
  }

  resolve(paymentId: number): void {
    this.paymentService.resolvePayment(paymentId).then(_ => {
      this.collections = this.collections.filter(p => p.id !== paymentId);
    });
  }
}
