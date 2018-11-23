import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { PartyType, PartyCreateRequest } from '../../types/party';

@Component({
  selector: 'app-party-create',
  templateUrl: './party-create.component.html',
  styleUrls: ['./party-create.component.css']
})
export class PartyCreateComponent implements OnInit {
  @Output() createParty: EventEmitter<PartyCreateRequest> = new EventEmitter();
  @Output() cancel: EventEmitter<void> = new EventEmitter();

  party: PartyCreateRequest = {
    name: '',
    type: PartyType.InGroup,
    location: '',
  };
  submitting = false;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  cancelButton() {
    this.cancel.emit();
  }

  createButton() {
    if (this.submitting) {
      return;
    }
    this.submitting = true;

    this.createParty.emit(this.party);
  }
}
