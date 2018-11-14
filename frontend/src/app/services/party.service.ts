import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Party, PartyState } from '../types/party';

import { Observable, of, Subscription } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  webSocket$: WebSocketSubject<any>;
  subscription: Subscription;

  joinedPartyId: number;
  partyState: PartyState;

  @Output() partyJoin: EventEmitter<number>;
  @Output() partyLeave: EventEmitter<number>;
  @Output() partyNotJoined: EventEmitter<void>;
  @Output() partyStateUpdate: EventEmitter<PartyState>;

  constructor(private http: HttpClient) {
    this.webSocket$ = undefined;
    this.joinedPartyId = 0;

    this.partyJoin = new EventEmitter();
    this.partyLeave = new EventEmitter();
    this.partyNotJoined = new EventEmitter();
    this.partyStateUpdate = new EventEmitter();
  }

  async getParties(): Promise<Party[]> {
    return await this.http.get<Party[]>('api/party/', httpOptions).toPromise();
  }

  async getParty(id: number): Promise<Party> {
    return await this.http.get<Party>(`api/party/${id}/`, httpOptions).toPromise();
  }

  async addParty(party: Partial<Party>): Promise<Party> {
    return await this.http.post<Party>('api/party/', party, httpOptions).toPromise();
  }

  async updateParty(party: Party): Promise<Party> {
    return await this.http.put<Party>(`api/party/${party.id}/`, party, httpOptions)
      .toPromise().then(() => party);
  }

  async deleteParty(id: number): Promise<void> {
    await this.http.delete(`api/party/${id}/`, httpOptions).toPromise();
  }

  handleWebsocket(closureThis: PartyService, json: any): void {
    if (json['type'] === 'party.join') {
      closureThis.partyJoin.emit(json['user_id']);
    } else if (json['type'] === 'party.leave') {
      closureThis.partyLeave.emit(json['user_id']);
    } else if (json['type'] === 'initial.not.joined') {
      console.log(closureThis.joinedPartyId);
      if (closureThis.joinedPartyId) {
        closureThis.webSocket$.next({
          'command': 'party.join',
          'party_id': closureThis.joinedPartyId
        });
      } else {
        closureThis.partyNotJoined.emit();
      }
    } else if (json['type'] === 'state.update') {
      closureThis.partyState = json['state'];
      closureThis.partyStateUpdate.emit(closureThis.partyState);
    }
  }

  joinParty(): void {
    if (this.webSocket$ === undefined) {
      this.webSocket$ = new WebSocketSubject('ws://localhost:8000/ws/party/');
    }
    this.subscription = this.webSocket$.subscribe(json =>
      this.handleWebsocket(this, json)
    );
  }

  leaveParty(): void {
    this.webSocket$.next({
      'command': 'party.leave',
      'party_id': this.joinedPartyId
    });
    this.joinedPartyId = 0;

    this.subscription.unsubscribe();
    this.webSocket$ = undefined;
  }
}
