import { deserialize, serialize } from 'cerialize';

export class Menu {
  @deserialize
  @serialize
  id: number;

  @deserialize
  @serialize
  name: string;

  @deserialize
  @serialize
  price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}
