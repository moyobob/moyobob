import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {MenuEntry, MenuEntryCreateRequest, MenuEntryUpdateRequest, PartyState} from "../../types/party";
import {User} from "../../types/user";
import {Menu} from "../../types/menu";
import {Restaurant} from "../../types/restaurant";

@Component({
  selector: 'app-party-choosing-restaurant',
  templateUrl: './party-choosing-restaurant.component.html',
  styleUrls: ['./party-choosing-restaurant.component.css']
})
export class PartyChoosingRestaurantComponent implements OnInit {
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() restaurants: Restaurant[];

  @Output() selectRestaurant: EventEmitter<RestaurantSelectRequest>;
  @Output() reselectRestaurant: EventEmitter<RestaurantReselectRequest>;

  showRestaurantPolly = false;

  constructor() {
    this.selectRestaurant = new EventEmitter();
    this.reselectRestaurant = new EventEmitter();
  }

  ngOnInit() {
  }

}
///*copy from party-choosing menu.

  menuEntries: MenuEntry[] = [];

  constructor() {
    this.addMenu = new EventEmitter();
    this.updateMenu = new EventEmitter();
  }

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
}

