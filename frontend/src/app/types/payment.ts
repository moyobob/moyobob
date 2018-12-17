import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';
import { User } from './user';
import { Menu } from './menu';

export class Payment {
  @serialize
  @deserialize
  id: number;

  @serialize
  @deserialize
  user: User;

  @serializeAs('paid_user')
  @deserializeAs('paid_user')
  paidUser: User;

  @serializeAs(Menu)
  @deserializeAs(Menu)
  menu: Menu;

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
    id: number, user: User, paidUser: User,
    menu: Menu, price: number, resolved: boolean, partyRecordId: number
  ) {
    this.id = id;
    this.user = user;
    this.paidUser = paidUser;
    this.menu = menu;
    this.price = price;
    this.resolved = resolved;
    this.partyRecordId = partyRecordId;
  }
}
