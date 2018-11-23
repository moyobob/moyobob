import { Injectable, EventEmitter } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Command, serializeCommand } from '../types/command';
import { Event, deserializeEvent } from '../types/event';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public onEvent: EventEmitter<Event> = new EventEmitter();

  websocket$: WebSocketSubject<any>;

  constructor() { }

  isConnected() {
    return this.websocket$ !== undefined && !this.websocket$.closed;
  }

  connect() {
    if (this.websocket$ === undefined) {
      this.websocket$ = new WebSocketSubject('ws://localhost:8000/ws/party/');
      this.websocket$.subscribe(json => this.receive(json));
    }
  }

  disconnect(): void {
    this.websocket$ = undefined;
  }

  receive(json: any): void {
    const event = deserializeEvent(json);
    this.onEvent.emit(event);
  }

  send(command: Command): void {
    if (this.isConnected()) {
      return;
    }

    const json = serializeCommand(command);
    this.websocket$.next(json);
  }
}
