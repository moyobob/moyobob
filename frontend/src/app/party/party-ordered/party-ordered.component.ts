import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { User } from '../../types/user';
import { Party, PartyState } from '../../types/party';

@Component({
  selector: 'app-party-ordered',
  templateUrl: './party-ordered.component.html',
  styleUrls: ['./party-ordered.component.css']
})
export class PartyOrderedComponent implements OnInit {

  @Input() party: Party;
  @Input() user: User;
  @Input() members: User[];
  @Output() toNextState: EventEmitter<User> = new EventEmitter();
  isPartyLeader: boolean;
  foodArrived: boolean;

  constructor() { }

  ngOnInit() {
    this.isPartyLeader = this.party.leaderId === this.user.id;
  }

  showFoodArrived() {
    this.foodArrived = true;
  }

  cancelFoodArrived() {
    this.foodArrived = false;
  }

  goNextState(paidUser: User) {
    this.toNextState.emit(paidUser);
  }

}
