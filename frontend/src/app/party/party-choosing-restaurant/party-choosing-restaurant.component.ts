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

  // @Output() selectRestaurant: EventEmitter<RestaurantSelectRequest>;
  // @Output() reselectRestaurant: EventEmitter<RestaurantReselectRequest>;

  showRestaurantPolly = false;

  constructor() {
    // this.selectRestaurant = new EventEmitter();
    // this.reselectRestaurant = new EventEmitter();
  }

  ngOnInit() {
  }

}
