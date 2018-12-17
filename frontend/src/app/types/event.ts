import { deserialize, deserializeAs, Deserialize } from 'cerialize';
import { PartyState } from './party';

export class Nothing { }

export class InvalidCommandError {
  @deserialize
  readonly type = 'error.invalid.command';
}

export class InvalidDataError {
  @deserialize
  readonly type = 'error.invalid.data';
}

export class InvalidUserError {
  @deserialize
  readonly type = 'error.invalid.user';
}

export class InvalidPartyError {
  @deserialize
  readonly type = 'error.invalid.party';
}

export class InvalidRestaurantError {
  @deserialize
  readonly type = 'error.invalid.restaurant';
}

export class InvalidMenuError {
  @deserialize
  readonly type = 'error.invalid.menu';
}

export class InvalidMenuEntryError {
  @deserialize
  readonly type = 'error.invalid.menu.entry';
}

export class NotJoinedError {
  @deserialize
  readonly type = 'error.not.joined';
}

export class AlreadyJoinedError {
  @deserialize
  readonly type = 'error.already.joined';
}

export class NotVotedError {
  @deserialize
  readonly type = 'error.not.voted';
}

export class InitiallyNotJoinedEvent {
  @deserialize
  readonly type = 'initial.not.joined';
}

export class PartyJoinEvent {
  @deserialize
  readonly type = 'party.join';

  @deserializeAs('user_id')
  userId: number;
}

export class PartyLeaveEvent {
  @deserialize
  readonly type = 'party.leave';

  @deserializeAs('user_id')
  userId: number;
}

export class PartyDeleteEvent {
  @deserialize
  readonly type = 'party.delete';
}

export class RestaurantVoteEvent {
  @deserialize
  readonly type = 'restaurant.vote';

  @deserializeAs('user_id')
  userId: number;

  @deserializeAs('restaurant_id')
  restaurantId: number;
}

export class RestaurantUnvoteEvent {
  @deserialize
  readonly type = 'restaurant.unvote';

  @deserializeAs('user_id')
  userId: number;

  @deserializeAs('restaurant_id')
  restaurantId: number;
}

export class MenuCreateEvent {
  @deserialize
  readonly type = 'menu.create';

  @deserializeAs('menu_entry_id')
  menuEntryId: number;

  @deserializeAs('menu_id')
  menuId: number;

  @deserializeAs('quantity')
  quantity: number;

  @deserializeAs('user_ids')
  userIds: number[];
}

export class MenuUpdateEvent {
  @deserialize
  readonly type = 'menu.update';

  @deserializeAs('menu_entry_id')
  menuEntryId: number;

  @deserialize
  quantity: number;

  @deserializeAs('add_user_ids')
  addUserIds: number[];

  @deserializeAs('remove_user_ids')
  removeUserIds: number[];
}

export class MenuDeleteEvent {
  @deserialize
  readonly type = 'menu.delete';

  @deserializeAs('menu_entry_id')
  menuEntryId: number;
}

export class StateUpdateEvent {
  @deserialize
  readonly type = 'state.update';

  @deserializeAs(PartyState)
  state: PartyState;
}

export class LeaderChangeEvent {
  @deserialize
  readonly type = 'leader.change';

  @deserializeAs('user_id')
  userId: number;
}

export class MenuConfirmEvent {
  @deserialize
  readonly type = 'menu.confirm';

  @deserializeAs('user_id')
  userId: number;
}

export class MenuUnconfirmEvent {
  @deserialize
  readonly type = 'menu.unconfirm';

  @deserializeAs('user_id')
  userId: number;
}

export type Event
  = Nothing
  | InvalidCommandError
  | InvalidDataError
  | InvalidUserError
  | InvalidPartyError
  | InvalidRestaurantError
  | InvalidMenuError
  | InvalidMenuEntryError
  | NotJoinedError
  | AlreadyJoinedError
  | NotVotedError
  | InitiallyNotJoinedEvent
  | PartyJoinEvent
  | PartyLeaveEvent
  | RestaurantVoteEvent
  | RestaurantUnvoteEvent
  | MenuCreateEvent
  | MenuUpdateEvent
  | MenuDeleteEvent
  | StateUpdateEvent
  | LeaderChangeEvent
  | MenuConfirmEvent
  | MenuUnconfirmEvent;

export function deserializeEvent(json: any): Event {
  switch (json['type']) {
    case 'error.invalid.command': return Deserialize(json, InvalidCommandError);
    case 'error.invalid.data': return Deserialize(json, InvalidDataError);
    case 'error.invalid.user': return Deserialize(json, InvalidUserError);
    case 'error.invalid.party': return Deserialize(json, InvalidPartyError);
    case 'error.invalid.restaurant': return Deserialize(json, InvalidRestaurantError);
    case 'error.invalid.menu': return Deserialize(json, InvalidMenuError);
    case 'error.invalid.menu.entry': return Deserialize(json, InvalidMenuEntryError);
    case 'error.not.joined': return Deserialize(json, NotJoinedError);
    case 'error.already.joined': return Deserialize(json, AlreadyJoinedError);
    case 'error.not.voted': return Deserialize(json, NotVotedError);
    case 'initial.not.joined': return Deserialize(json, InitiallyNotJoinedEvent);
    case 'party.join': return Deserialize(json, PartyJoinEvent);
    case 'party.leave': return Deserialize(json, PartyLeaveEvent);
    case 'party.delete': return Deserialize(json, PartyDeleteEvent);
    case 'restaurant.vote': return Deserialize(json, RestaurantVoteEvent);
    case 'restaurant.unvote': return Deserialize(json, RestaurantUnvoteEvent);
    case 'menu.create': return Deserialize(json, MenuCreateEvent);
    case 'menu.update': return Deserialize(json, MenuUpdateEvent);
    case 'menu.delete': return Deserialize(json, MenuDeleteEvent);
    case 'state.update': return Deserialize(json, StateUpdateEvent);
    case 'leader.change': return Deserialize(json, LeaderChangeEvent);
    case 'menu.confirm': return Deserialize(json, MenuConfirmEvent);
    case 'menu.unconfirm': return Deserialize(json, MenuUnconfirmEvent);
    default: return Nothing;
  }
}
