import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Party, PartyState, MenuEntryCreateRequest, MenuEntryUpdateRequest, PartyCreateRequest } from '../types/party';

import { WebsocketService } from './websocket.service';
import {
  Event, PartyJoinEvent, PartyLeaveEvent, InitiallyNotJoinedEvent, StateUpdateEvent, MenuCreateEvent, MenuUpdateEvent
} from '../types/event';
import {
  PartyJoinCommand, PartyLeaveCommand,
  MenuCreateCommand, MenuUpdateCommand,
  ToOrderedCommand,
} from '../types/command';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PartyService {
  public partyStateUpdate: EventEmitter<PartyState> = new EventEmitter();
  public initiallyNotJoined: EventEmitter<void> = new EventEmitter();

  partyState: PartyState;

  constructor(
    private websocketService: WebsocketService,
    private http: HttpClient,
  ) {
    this.websocketService.onEvent.subscribe(event => {
      this.onWebsocketEvent(event);
    });
  }

  async getParties(): Promise<Party[]> {
    return await this.http.get<Party[]>('api/party/', httpOptions).toPromise();
  }

  async getParty(id: number): Promise<Party> {
    if (id) {
      return await this.http.get<Party>(`api/party/${id}/`, httpOptions).toPromise();
    } else {
      return await undefined;
    }
  }

  async addParty(party: PartyCreateRequest): Promise<Party> {
    return await this.http.post<Party>('api/party/', party, httpOptions).toPromise();
  }

  async updateParty(party: Party): Promise<Party> {
    return await this.http.put<Party>(`api/party/${party.id}/`, party, httpOptions)
      .toPromise().then(() => party);
  }

  async deleteParty(id: number): Promise<void> {
    await this.http.delete(`api/party/${id}/`, httpOptions).toPromise();
  }

  connectWebsocket(): void {
    this.websocketService.connect();
  }

  onWebsocketEvent(rawEvent: Event): void {
    if (rawEvent instanceof StateUpdateEvent) {
      const event = <StateUpdateEvent>rawEvent;

      this.partyState = event.state;
      this.partyStateUpdate.emit(this.partyState);
    }

    if (this.partyState === undefined) {
      return;
    }

    switch (true) {
      case rawEvent instanceof PartyJoinEvent: {
        const event = <PartyJoinEvent>rawEvent;

        this.partyState.memberIds.push(event.userId);
        this.partyStateUpdate.emit(this.partyState);

        break;
      }
      case rawEvent instanceof PartyLeaveEvent: {
        const event = <PartyLeaveEvent>rawEvent;

        this.partyState.memberIds = this.partyState.memberIds.filter(id => id !== event.userId);
        this.partyStateUpdate.emit(this.partyState);

        break;
      }
      case rawEvent instanceof InitiallyNotJoinedEvent: {
        this.initiallyNotJoined.emit();

        break;
      }
      case rawEvent instanceof MenuCreateEvent: {
        const event = <MenuCreateEvent>rawEvent;

        this.partyState.menuEntries.push({
          id: event.menuEntryId,
          menuId: event.menuId,
          quantity: event.quantity,
          userIds: event.userIds,
        });
        this.partyStateUpdate.emit(this.partyState);

        break;
      }
      case rawEvent instanceof MenuUpdateEvent: {
        const event = <MenuUpdateEvent>rawEvent;

        this.partyState.menuEntries = this.partyState.menuEntries
          .map(entry => {
            if (entry.id === event.menuEntryId) {
              entry.quantity += event.quantity;
              entry.userIds = entry.userIds
                .concat(event.addUserIds)
                .filter(id => !event.removeUserIds.includes(id));
            }
            return entry;
          });
        this.partyStateUpdate.emit(this.partyState);

        break;
      }
    }
  }

  joinParty(partyId: number): void {
    if (this.partyState !== undefined) {
      return;
    }

    const command = new PartyJoinCommand(partyId);
    this.websocketService.send(command);
  }

  leaveParty(): void {
    if (this.partyState === undefined) {
      return;
    }

    const command = new PartyLeaveCommand(this.partyState.id);
    this.websocketService.send(command);
  }

  createMenu(request: MenuEntryCreateRequest) {
    const command = new MenuCreateCommand(
      request.menuId,
      request.quantity,
      request.users,
    );
    this.websocketService.send(command);
  }

  updateMenu(request: MenuEntryUpdateRequest) {
    const command = new MenuUpdateCommand(
      request.id,
      request.quantityDelta,
      request.addUserIds,
      request.removeUserIds,
    );
    this.websocketService.send(command);
  }

  toOrdered() {
    const command = new ToOrderedCommand();
    this.websocketService.send(command);
  }
}
