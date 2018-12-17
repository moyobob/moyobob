import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Restaurant} from '../../../types/restaurant';

@Component({
  selector: 'app-add-vote-object',
  templateUrl: './add-vote-object.component.html',
  styleUrls: ['./add-vote-object.component.css']
})
export class AddVoteObjectComponent implements OnInit {
  @Input() restaurants: Restaurant[];
  @Input() loggedInUserId: number;
  @Output() clickRestaurant: EventEmitter<number>;
  chosenRestaurant: Restaurant;

  constructor() {
    this.clickRestaurant = new EventEmitter();
  }

  ngOnInit() {
  }

  onClickRestaurant(): void {
    if (this.chosenRestaurant != null) {
      this.clickRestaurant.emit(this.chosenRestaurant.id);
    }
  }
}

