import { serialize, serializeAs, Serialize } from 'cerialize';

export interface Command {
  readonly command: string;
}

export class PartyJoinCommand implements Command {
  @serialize
  readonly command = 'party.join';

  @serializeAs('party_id')
  partyId: number;

  constructor(partyId: number) {
    this.partyId = partyId;
  }
}

export class PartyLeaveCommand implements Command {
  @serialize
  readonly command = 'party.leave';

  @serializeAs('party_id')
  partyId: number;

  constructor(partyId: number) {
    this.partyId = partyId;
  }
}

export class ToChoosingMenuCommand implements Command {
  @serialize
  readonly command = 'to.choosing.menu';

  @serializeAs('restaurant_id')
  restaurantId: number;

  constructor(restaurantId: number) {
    this.restaurantId = restaurantId;
  }
}

export class ToOrderingCommand implements Command {
  @serialize
  readonly command = 'to.ordering';

  constructor() { }
}

export class ToOrderedCommand implements Command {
  @serialize
  readonly command = 'to.ordered';

  constructor() { }
}

export class ToPaymentCommand implements Command {
  @serialize
  readonly command = 'to.payment';

  @serializeAs('paid_user_id')
  paidUserId: number;

  constructor(paidUserId: number) {
    this.paidUserId = paidUserId;
  }
}

export class RestaurantVoteToggleCommand implements Command {
  @serialize
  readonly command = 'restaurant.vote.toggle';

  @serializeAs('restaurant_id')
  restaurantId: number;

  constructor(restaurantId: number) {
    this.restaurantId = restaurantId;
  }
}

export class MenuCreateCommand implements Command {
  @serialize
  readonly command = 'menu.create';

  @serializeAs('menu_id')
  menuId: number;

  @serializeAs('quantity')
  quantity: number;

  @serializeAs('user_ids')
  userIds: number[];

  constructor(menuId: number, quantity: number, userIds: number[]) {
    this.menuId = menuId;
    this.quantity = quantity;
    this.userIds = userIds;
  }
}

export class MenuUpdateCommand implements Command {
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

  constructor(
    menuEntryId: number,
    quantity: number,
    addUserIds: number[],
    removeUserIds: number[],
  ) {
    this.menuEntryId = menuEntryId;
    this.quantity = quantity;
    this.addUserIds = addUserIds;
    this.removeUserIds = removeUserIds;
  }
}

export class MenuDeleteCommand implements Command {
  @serialize
  readonly command = 'menu.delete';

  @serializeAs('menu_entry_id')
  menuEntryId: number;

  constructor(menuEntryId: number) {
    this.menuEntryId = menuEntryId;
  }
}

export class ToggleConfirmCommand implements Command {
  @serialize
  readonly command = 'menu.confirm.toggle';

  constructor() { }
}

export function serializeCommand(command: Command): any {
  switch (command.command) {
    case 'party.join': {
      return Serialize(command, PartyJoinCommand);
      break;
    }
    case 'party.leave': {
      return Serialize(command, PartyLeaveCommand);
      break;
    }
    case 'to.choosing.menu': {
      return Serialize(command, ToChoosingMenuCommand);
      break;
    }
    case 'to.ordering': {
      return Serialize(command, ToOrderingCommand);
      break;
    }
    case 'to.ordered': {
      return Serialize(command, ToOrderedCommand);
      break;
    }
    case 'to.payment': {
      return Serialize(command, ToPaymentCommand);
      break;
    }
    case 'restaurant.vote.toggle': {
      return Serialize(command, RestaurantVoteToggleCommand);
      break;
    }
    case 'menu.create': {
      return Serialize(command, MenuCreateCommand);
      break;
    }
    case 'menu.update': {
      return Serialize(command, MenuUpdateCommand);
      break;
    }
    case 'menu.delete': {
      return Serialize(command, MenuDeleteCommand);
      break;
    }
    case 'menu.confirm.toggle': {
      return Serialize(command, ToggleConfirmCommand);
      break;
    }

    default: {
      return {};
    }
  }
}
