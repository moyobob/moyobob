import { deserialize, deserializeAs } from 'cerialize';

export enum PartyType {
  InGroup = 0,
  Private = 1,
}

export class Party {
  @deserialize
  id: number;

  @deserialize
  name: string;

  @deserialize
  type: PartyType;

  @deserialize
  location: string;

  @deserializeAs('leader_id')
  leaderId: number;

  @deserialize
  since: string;

  @deserializeAs('member_count')
  memberCount: number;
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

  @deserializeAs('member_ids')
  memberIds: number[];

  menuEntries: MenuEntry[];

  public static OnDeserialized(instance: PartyState, json: any): void {
    const menuEntries: MenuEntry[] = [];

    for (const menuEntryId of Object.keys(json['state']['menu_entries'])) {
      const [menuId, quantity, userIds] = json['state']['menu_entries'][menuEntryId];

      menuEntries.push({
        id: +menuEntryId,
        menuId: menuId,
        quantity: quantity,
        userIds: userIds,
      });
    }
    instance.menuEntries = menuEntries;
  }
}
