import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Menu } from '../../../types/menu';
import { MenuEntryCreateRequest } from '../../../types/party';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.css']
})
export class SelectMenuComponent implements OnInit {

  @Input() menus: Menu[];
  @Input() loggedInUserId: number;
  @Output() request: EventEmitter<MenuEntryCreateRequest>;
  @Output() cancel: EventEmitter<void>;

  menuId: number;
  quantity: number;

  constructor() {
    this.request = new EventEmitter();
    this.cancel = new EventEmitter();
  }

  ngOnInit() {
  }

  addRequest() {
    if (this.menuId === undefined || !this.quantity) {
      // TODO: showing error
    } else {
      this.request.next({
        menuId: +this.menuId,
        quantity: this.quantity,
        users: [this.loggedInUserId]
      });
    }
  }

  cancelRequest() {
    this.cancel.next();
  }

}
