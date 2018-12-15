import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  shouldPayList: [number, number][]; // receiverId, totalCost
  bePaidList: [number, number][]; // senderId, totalCost
  constructor() { }

  ngOnInit() {
  }

  getUserNameById(Id: number): string {
    return ''
  }

  getMeansById(Id: number): string {
    return ''
  }

  resolve(senderId: number): void {

  }

}
