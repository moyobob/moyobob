import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Restaurant} from "../../../types/restaurant";

@Component({
  selector: 'app-add-vote-object',
  templateUrl: './add-vote-object.component.html',
  styleUrls: ['./add-vote-object.component.css']
})
export class AddVoteObjectComponent implements OnInit {
  @Input() restaurants: Restaurant[];
  @Input() loggedInUserId: number;
  @Output() clickRestaurant: EventEmitter<number>;
  @Output() cancel: EventEmitter<void>;

  constructor() {
    this.clickRestaurant = new EventEmitter();
    this.cancel = new EventEmitter();
  }

  ngOnInit() {
  }

  onClickRestaurant(restaurantId: number) {
    this.clickRestaurant.emit(restaurantId);
  }

  onCancelButtonClick() {
    this.cancel.emit();
  }
}

