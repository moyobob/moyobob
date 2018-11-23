import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Menu, PartyMenu, PartyMenuUpdateRequest, PartyMenuCreateRequest } from '../types/menu';
import { PartyState, Party } from '../../types/party';
import { User } from '../../types/user';

@Component({
  selector: 'app-party-choosing-menu',
  templateUrl: './party-choosing-menu.component.html',
  styleUrls: ['./party-choosing-menu.component.css']
})
export class PartyChoosingMenuComponent implements OnInit, OnChanges {
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() menus: Menu[];

  @Output() addMenu: EventEmitter<PartyMenuCreateRequest>;
  @Output() updateMenu: EventEmitter<PartyMenuUpdateRequest>;

  menuEntries: PartyMenu[];
  showAddMenuDialog: boolean;

  constructor() {
    this.addMenu = new EventEmitter();
    this.updateMenu = new EventEmitter();
  }

  ngOnInit() {
    this.menuEntries = [];
    this.showAddMenuDialog = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.partyState) {
      this.menuEntries = this.partyState.menuEntries;
    }
  }

  getMenuNameById(id: number) {
    const menu = this.menus.filter(menuor => menuor.id === id);
    if (menu.length) {
      return menu[0].name;
    }
    return '';
  }

  requestAddMenu(event) {
    this.addMenu.emit(event);
    this.showAddMenuDialog = false;
  }

  cancelAddMenu(event) {
    this.showAddMenuDialog = false;
  }

  toggleAddMenu() {
    this.showAddMenuDialog = !this.showAddMenuDialog;
  }

  isAssigned(userIds) {
    return userIds.some(x => x === this.user.id);
  }

  updatePartyMenu(partyMenu, quantityDelta, removing) {
    let req: PartyMenuUpdateRequest;

    if (partyMenu.quantity + quantityDelta <= 0 ||
      partyMenu.userIds.length + quantityDelta <= 0) {
      req = {
        id: partyMenu.id,
        quantityDelta: -partyMenu.quantity,
        addUserIds: [],
        removeUserIds: partyMenu.userIds
      };
    } else if (removing) {
      req = {
        id: partyMenu.id,
        quantityDelta: quantityDelta,
        addUserIds: [],
        removeUserIds: [this.user.id]
      };
    } else {
      req = {
        id: partyMenu.id,
        quantityDelta: quantityDelta,
        addUserIds: [this.user.id],
        removeUserIds: []
      };
    }

    this.updateMenu.emit(req);
  }
}
