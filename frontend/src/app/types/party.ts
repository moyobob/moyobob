enum PartyType {
  InGroup = 0,
  Private = 1,
}

export class Party {
  id: number;
  name: string;
  type: PartyType;
  location: string;
  leader_id: number;
  since: string;
}
