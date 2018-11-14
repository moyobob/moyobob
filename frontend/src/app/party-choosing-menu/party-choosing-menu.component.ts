import { Component, OnInit } from '@angular/core';

import { PartyService } from '../services/party.service';
import { UserService } from '../services/user.service';
import { Menu } from '../types/menu';

@Component({
  selector: 'app-party-choosing-menu',
  templateUrl: './party-choosing-menu.component.html',
  styleUrls: ['./party-choosing-menu.component.css']
})
export class PartyChoosingMenuComponent implements OnInit {

  menus: Menu[];
  randomVal: number;

  constructor(private userService: UserService, private partyService: PartyService) { }

  ngOnInit() {
    this.randomVal = 10;
    this.partyService.getMenus().then(menus => {
      this.menus = menus;
    });
    this.partyService.partyMenuAssign.subscribe(() => {
      this.randomVal = Math.random();
    });
  }

  getAssignee(id: number, randomVal: number) {
    return this.partyService.partyState.menus
      .filter(tuple => {
        let [assigneeId, menuId] = tuple;
        return menuId === id;
      })
      .map(tuple => {
        let [assigneeId, menuId] = tuple;
        return assigneeId;
      })
  }

  isAssigned(id: number) {
    return !(this.partyService.partyState.menus
      .filter(tuple => {
        let [assigneeId, menuId] = tuple;
        return menuId === id && assigneeId === this.userService.signedInUserId;
      }).length);
  }

  assign(id: number) {
    this.partyService.assignToMenu(id, this.userService.signedInUserId);
  }

}
