import {Component, OnInit, Output, EventEmitter, Inject} from '@angular/core';

import { PartyCreateRequest, PartyType} from '../../types/party';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-party-create',
  templateUrl: './party-create.component.html',
  styleUrls: ['./party-create.component.css']
})
export class PartyCreateComponent implements OnInit {

  name: string;
  type: PartyType;
  location: string;

  constructor(public dialogRef: MatDialogRef<PartyCreateComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  tryCreateParty(): void {
    if (this.name && this.type && this.location) {
      const req = new PartyCreateRequest();
      req.name = this.name;
      req.type = this.type;
      req.location = this.location;
      this.dialogRef.close(req);
    }
  }
}
