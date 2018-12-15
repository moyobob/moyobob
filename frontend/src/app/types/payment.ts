import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';

export class Payment {
  @serialize
  @deserialize
  id: number;

  @serializeAs('user_id')
  @deserializeAs('user_id')
  userId: number;

  @serializeAs('paid_user_id')
  @deserializeAs('paid_user_id')
  paidUserId: number;

  @serializeAs('menu_id')
  @deserializeAs('menu_id')
  menuId: number;

  @serialize
  @deserialize
  price: number;

  @serialize
  @deserialize
  resolved: boolean;

  @serializeAs('party_record_id')
  @deserializeAs('party_record_id')
  partyRecordId: number;

  constructor(
    id: number, userId: number, paidUserId: number,
    menuId: number, price: number, resolved: boolean, partyRecordId: number
  ) {
    this.id = id;
    this.userId = userId;
    this.paidUserId = paidUserId;
    this.menuId = menuId;
    this.price = price;
    this.resolved = resolved;
    this.partyRecordId = partyRecordId;
  }
}
