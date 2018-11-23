import { serialize, serializeAs } from 'cerialize';

export interface Command {
  readonly command: string;
}

export class PartyJoin implements Command {
  @serialize
  readonly command = 'party.join';

  @serializeAs('party_id')
  partyId: number;
}

export class PartyLeave implements Command {
  @serialize
  readonly command = 'party.leave';

  @serializeAs('party_id')
  partyId: number;
}

export class RestaurantVote implements Command {
  @serialize
  readonly command = 'restaurant.vote';

  @serializeAs('restaurant_id')
  restaurantId: number;
}

export class RestaurantUnvote implements Command {
  @serialize
  readonly command = 'restaurant.unvote';

  @serializeAs('restaurant_id')
  restaurantId: number;
}

export class MenuCreate implements Command {
  @serialize
  readonly command = 'menu.create';

  @serializeAs('menu_id')
  menuId: number;

  @serializeAs('user_ids')
  userIds: number[];
}

export class MenuUpdate implements Command {
  @serialize
  readonly command = 'menu.update';

  @serializeAs('menu_entry_id')
  menuEntryId: number;

  @serializeAs('quantity')
  quantity: number;

  @serializeAs('add_user_ids')
  addUserIds: number[];

  @serializeAs('remove_user_ids')
  removeUserIds: number[];
}

export class MenuDelete implements Command {
  @serialize
  readonly command = 'menu.delete';

  @serializeAs('menu_entry_id')
  menuEntryId: number;
}
