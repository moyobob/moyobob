import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';

export enum PartyType {
  InGroup = 0,
  Private = 1,
}

export class Party {
  @serialize
  @deserialize
  id: number;

  @serialize
  @deserialize
  name: string;

  @serialize
  @deserialize
  type: PartyType;

  @serialize
  @deserialize
  location: string;

  @serializeAs('leader_id')
  @deserializeAs('leader_id')
  leaderId: number;

  @serialize
  @deserialize
  since: string;

  @serializeAs('member_count')
  @deserializeAs('member_count')
  memberCount: number;

  constructor(
    id: number, name: string, type: PartyType, location: string,
    leaderId: number, since: string, memberCount: number,
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.location = location;
    this.leaderId = leaderId;
    this.since = since;
    this.memberCount = memberCount;
  }
}

export enum PartyPhase {
  ChoosingRestaurant = 0,
  ChoosingMenu = 1,
  Ordering = 2,
  Ordered = 3,
  PaymentAndCollection = 4,
}

export class MenuEntry {
  id: number;
  menuId: number;
  quantity: number;
  userIds: number[];
}

export class PartyCreateRequest {
  name: string;
  type: PartyType;
  location: string;
}

export class MenuEntryCreateRequest {
  menuId: number;
  quantity: number;
  users: number[];
}

export class MenuEntryUpdateRequest {
  id: number;
  quantityDelta: number;
  addUserIds: number[];
  removeUserIds: number[];
}

export class PartyState {
  @deserialize
  id: number;

  @deserialize
  phase: PartyPhase;

  @deserializeAs('restaurant_id')
  restaurantId?: number;

  // User's id, Restaurant's id
  @deserializeAs('restaurant_votes')
  restaurantVotes: [number, number][];

  @deserializeAs('member_ids')
  memberIds: number[];

  @deserializeAs('paid_user_id')
  paidUserId?: number;

  @deserializeAs('menu_confirmed_user_ids')
  menuConfirmedUserIds: number[];

  menuEntries: MenuEntry[];

  public static OnDeserialized(instance: PartyState, json: any): void {
    const menuEntries: MenuEntry[] = [];

    for (const menuEntryId of Object.keys(json['menu_entries'])) {
      const [menuId, quantity, userIds] = json['menu_entries'][menuEntryId];
      const entry: MenuEntry = {
        id: +menuEntryId,
        menuId: +menuId,
        quantity: +quantity,
        userIds: userIds.map(id => +id),
      };

      menuEntries.push(entry);
    }
    instance.menuEntries = menuEntries;
  }
}

export class PartyRecord {
  @serialize
  @deserialize
  id: number;

  @serialize
  @deserialize
  name: string;

  @serialize
  @deserialize
  type: PartyType;

  @serialize
  @deserialize
  location: string;

  @serializeAs('leader_id')
  @deserializeAs('leader_id')
  leaderId: number;

  @serialize
  @deserialize
  since: string;

  @serialize
  @deserialize
  until: string;

  @serializeAs('member_ids')
  @deserializeAs('member_ids')
  memberIds: number[];

  @serializeAs('restaurant_id')
  @deserializeAs('restaurant_id')
  restaurantId: number;

  @serializeAs('paid_user_id')
  @deserializeAs('paid_user_id')
  paidUserId: number;

  @serializeAs('payment_ids')
  @deserializeAs('payment_ids')
  paymentIds: number[];

  constructor(
    id: number, name: string, type: PartyType, location: string,
    leaderId: number, since: string, memberIds: number[], restaurantId: number,
    paidUserId: number, paymentIds: number[]
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.location = location;
    this.leaderId = leaderId;
    this.since = since;
    this.memberIds = memberIds;
    this.restaurantId = restaurantId;
    this.paidUserId = paidUserId;
    this.paymentIds = paymentIds;
  }
}
