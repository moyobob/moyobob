import { Component, OnInit, OnChanges, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';

import { User } from '../../types/user';
import { Party, PartyState, MenuEntry } from '../../types/party';
import { Menu } from '../../types/menu';

@Component({
  selector: 'app-party-ordered',
  templateUrl: './party-ordered.component.html',
  styleUrls: ['./party-ordered.component.css']
})
export class PartyOrderedComponent implements OnInit, OnChanges {

  @Input() party: Party;
  @Input() user: User;
  @Input() menus: Menu[];
  @Input() menuEntries: MenuEntry[];
  @Input() members: User[];

  @Output() toNextState: EventEmitter<User> = new EventEmitter();

  isPartyLeader: boolean;
  foodArrived: boolean;

  totalMoney: number;

  constructor() { }

  ngOnInit() {
    this.isPartyLeader = this.party.leaderId === this.user.id;
    this.totalMoney = this.calculateTotalCost(this.menuEntries);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.totalMoney = this.calculateTotalCost(this.menuEntries);
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

  calculateTotalCost(menuEntries: MenuEntry[]): number {
    if (!this.menus) {
      return 0;
    }
    return menuEntries.filter(x => x.userIds.includes(this.user.id))
      .map(x => {
        const menu = this.menus.find(u => u.id === x.menuId);
        if (menu) {
          return menu.price * x.quantity / x.userIds.length;
        }
        return -1;
      })
      .reduce((x, y) => x + y, 0);
  }

}
