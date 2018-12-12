import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';

export class Restaurant {
  @serialize
  @deserialize
  id: number;

  @serialize
  @deserialize
  name: string;

  @serializeAs('menu_ids')
  @deserializeAs('menu_ids')
  menuIds: number[];

  constructor(id: number, name: string, menuIds: number[]) {
    this.id = id;
    this.name = name;
    this.menuIds = menuIds;
  }
}
