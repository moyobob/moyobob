import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Menu} from "../../types/menu";
import {User} from "../../types/user";
import {Party, PartyState} from "../../types/party";

@Component({
  selector: 'app-party-payment',
  templateUrl: './party-payment.component.html',
  styleUrls: ['./party-payment.component.css']
})
export class PartyPaymentComponent implements OnInit {

  @Input() party: Party;
  @Input() partyState: PartyState;
  @Input() user: User;
  @Output() toNextState: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
