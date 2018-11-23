import { deserialize, deserializeAs } from 'cerialize';
import { PartyState } from './party';

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

export class InitiallyNotJoined {
  @deserialize
  readonly type = 'initial.not.joined';
}

export class PartyJoin {
  @deserialize
  readonly type = 'party.join';

  @deserializeAs('user_id')
  userId: number;
}

export class PartyLeave {
  @deserialize readonly type = 'party.leave';

  @deserializeAs('user_id')
  userId: number;
}

export class RestaurantVote {
  @deserialize
  readonly type = 'restaurant.vote';

  @deserializeAs('restaurant_id')
  restaurantId: number;
}

export class RestaurantUnvote {
  @deserialize
  readonly type = 'restaurant.unvote';

  @deserializeAs('restaurant_id')
  restaurantId: number;
}

export class MenuCreate {
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

export class MenuUpdate {
  @deserialize
  readonly type = 'menu.update';

  @deserializeAs('menu_entry_id')
  menuEntryId: number;

  quantity: number;

  @deserializeAs('add_user_ids')
  addUserIds: number[];

  @deserializeAs('remove_user_ids')
  removeUserIds: number[];
}

export class MenuDelete {
  @deserialize
  readonly type = 'menu.delete';

  @deserializeAs('menu_entry_id')
  menuEntryId: number;
}

export class StateUpdate {
  @deserialize
  readonly type = 'state.update';

  state: PartyState;
}

export class LeaderChange {
  @deserialize
  readonly type = 'leader.change';

  @deserializeAs('user_id')
  userId: number;
}

export type Event
  = InvalidCommandError
  | InvalidDataError
  | InvalidUserError
  | InvalidPartyError
  | InvalidRestaurantError
  | InvalidMenuError
  | InvalidMenuEntryError
  | NotJoinedError
  | AlreadyJoinedError
  | NotVotedError
  | InitiallyNotJoined
  | PartyJoin
  | PartyLeave
  | RestaurantVote
  | RestaurantUnvote
  | MenuCreate
  | MenuUpdate
  | MenuDelete
  | StateUpdate
  | LeaderChange;
