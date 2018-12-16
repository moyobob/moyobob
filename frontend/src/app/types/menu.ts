import { deserialize } from 'cerialize';

export class Menu {
  @deserialize
  id: number;

  @deserialize
  name: string;

  @deserialize
  price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}
