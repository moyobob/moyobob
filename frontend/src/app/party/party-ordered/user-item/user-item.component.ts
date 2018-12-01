import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { User } from '../../../types/user';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css']
})
export class UserItemComponent implements OnInit {

  @Input() user: User;
  @Output() userSelected: EventEmitter<User> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  selectUser() {
    this.userSelected.emit(this.user);
  }

}
