// import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
// import {Menu} from "../../../../types/menu";
// import {MenuEntryCreateRequest} from "../../../../types/party";
// import {Restaurant} from "../../../../types/restaurant";
//
// @Component({
//   selector: 'app-add-vote-object',
//   templateUrl: './add-vote-object.component.html',
//   styleUrls: ['./add-vote-object.component.css']
// })
// export class AddVoteObjectComponent implements OnInit {
//   @Input() restaurants: Restaurant[];
//   @Input() loggedInUserId: number;
//   @Output() request: EventEmitter<VoteObject>;
//   @Output() cancel: EventEmitter<void>;
//   constructor() { }
//
//   ngOnInit() {
//   }
//
// }
//
// export class SelectMenuComponent implements OnInit {
//
//   @Input() menus: Menu[];
//   @Input() loggedInUserId: number;
//   @Output() request: EventEmitter<MenuEntryCreateRequest>;
//   @Output() cancel: EventEmitter<void>;
//
//   menuId: number;
//   quantity: number;
//
//   constructor() {
//     this.request = new EventEmitter();
//     this.cancel = new EventEmitter();
//   }
//
//   ngOnInit() {
//   }
//
//   addRequest() {
//     const requestMenu: number = this.menuId === undefined ? undefined : +this.menuId;
//     if (requestMenu === undefined || !this.quantity) {
//       //
//     } else {
//       this.request.next({
//         menuId: requestMenu,
//         quantity: this.quantity,
//         users: [this.loggedInUserId]
//       });
//     }
//   }
//
//   cancelRequest() {
//     this.cancel.next();
//   }
//
// }
