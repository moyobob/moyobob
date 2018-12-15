import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import { Menu } from '../../types/menu';
import { User } from '../../types/user';
import { Party, PartyState } from '../../types/party';

@Component({
  selector: 'app-party-payment',
  templateUrl: './party-payment.component.html',
  styleUrls: ['./party-payment.component.css']
})
export class PartyPaymentComponent implements OnInit {

  @Input() party: Party;
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() menus: Menu[];
  @Output() toNextState: EventEmitter<void> = new EventEmitter();

  myMenus: [number, number, number][]; // menuId, menuPrice, menuQuantity
  totalCost: number;

  constructor() {
    this.toNextState = new EventEmitter();
  }

  ngOnInit() {
    this.makeMyMenus();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.makeMyMenus();
  }

  makeMyMenus(): void {
    if (this.partyState === undefined) {
      return;
    }

    for (const entry of this.partyState.menuEntries) {
      if (entry.userIds.includes(this.user.id)) {
        const menuPrice = this.getMenuPriceById(entry.menuId);
        this.myMenus.push([entry.menuId, menuPrice, entry.quantity / entry.userIds.length]);
        this.totalCost += menuPrice * entry.quantity / entry.userIds.length;
      }
    }
  }

  getMenuPriceById(id: number): number {
    if (this.menus === undefined) {
      return 0;
    }

    const menu = this.menus.filter(menuor => menuor.id === id);
    if (menu.length) {
      return menu[0].price;
    }
    return 0;
  }

  getMenuNameById(id: number): string {
    if (this.menus === undefined) {
      return '';
    }

    const menu = this.menus.filter(menuor => menuor.id === id);
    if (menu.length) {
      return menu[0].name;
    }
    return '';
  }

  toFinish(): void {
    this.toNextState.emit();
  }
}
