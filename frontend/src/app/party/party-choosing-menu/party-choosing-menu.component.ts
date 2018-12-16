import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Menu } from '../../types/menu';
import { PartyState, MenuEntry, MenuEntryCreateRequest, MenuEntryUpdateRequest } from '../../types/party';
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

  @Output() addMenu: EventEmitter<MenuEntryCreateRequest> = new EventEmitter();
  @Output() updateMenu: EventEmitter<MenuEntryUpdateRequest> = new EventEmitter();
  @Output() toNextState: EventEmitter<void> = new EventEmitter();

  menuEntries: MenuEntry[] = [];
  showAddMenuDialog = false;

  constructor() { }

  ngOnInit() {
    this.updateState();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
  }

  updateState() {
    if (this.partyState) {
      this.menuEntries = this.partyState.menuEntries;
    }
  }

  getMenuNameById(id: number) {
    if (this.menus) {
      const menu = this.menus.filter(menuor => menuor.id === id);
      if (menu.length) {
        return menu[0].name;
      }
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
    let req: MenuEntryUpdateRequest;

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

  onNextStateButtonClick(): void {
    this.toNextState.emit();
  }
}
