import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Party } from '../types/party';

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

  @Output()
  partyJoin: EventEmitter<number> = new EventEmitter();
  partyLeave: EventEmitter<number> = new EventEmitter();

  constructor(private http: HttpClient) {
    this.webSocket$ = undefined;
    this.joinedPartyId = 0;
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

  handle(json: any): void {
    if (json['type'] === 'party.join') {
      this.partyJoin.emit(json['user_id']);
    } else if (json['type'] === 'party.leave') {
      this.partyLeave.emit(json['user_id']);
    }
  }

  joinParty(id: number): void {
    if (this.webSocket$ === undefined) {
      this.webSocket$ = new WebSocketSubject('ws://localhost:8000/ws/party/');
    }
    this.subscription = this.webSocket$.subscribe(this.handle);
    this.webSocket$.next({
      'command': 'party.join',
      'party_id': id
    });
    this.joinedPartyId = id;
  }

  leaveParty(id: number): void {
    this.webSocket$.next({
      'command': 'party.leave',
      'party_id': id
    });
    this.joinedPartyId = 0;

    this.subscription.unsubscribe();
    this.webSocket$ = undefined;
  }
}
