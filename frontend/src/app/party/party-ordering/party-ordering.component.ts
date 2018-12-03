import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Menu } from '../../types/menu';
import { User } from '../../types/user';
import { Party, PartyState } from '../../types/party';

@Component({
  selector: 'app-party-ordering',
  templateUrl: './party-ordering.component.html',
  styleUrls: ['./party-ordering.component.css']
})
export class PartyOrderingComponent implements OnInit {

  @Input() menus: Menu[];
  @Input() user: User;
  @Input() party: Party;
  @Input() partyState: PartyState;
  @Output() toNextState: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  findMenuNameById(id: number) {
    if (this.menus === undefined) {
      return undefined;
    }
    const menus = this.menus.filter(menu => menu.id === id);
    if (menus.length > 0) {
      return menus[0].name;
    }
    return undefined;
  }

  toOrdered() {
    this.toNextState.emit();
  }

}
