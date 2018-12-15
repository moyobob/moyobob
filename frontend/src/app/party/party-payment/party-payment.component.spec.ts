import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyPaymentComponent } from './party-payment.component';
import { PartyState } from '../../types/party';

const mockUser = { id: 1, email: 'ferris@rustaceans.org', username: 'ferris' };
const mockParty = { id: 1, name: 'mockParty', type: 0, location: 'location1', leaderId: 1, since: '0000', memberCount: 2 };
const mockMenuEntry1 =  { id: 1, menuId: 20, quantity: 1, userIds: [1, 10]}; // chicken
const mockMenuEntry2 = { id: 2, menuId: 30, quantity: 1, userIds: [1]}; // pasta
const mockMenuEntry3 = { id: 3, menuId: 40, quantity: 1, userIds: [10]};
const mockMenu1 = { id: 20, name: 'chicken', price: 20000};
const mockMenu2 = { id: 30, name: 'pasta', price: 15000};
const mockMenu3 = { id: 40, name: 'cake', price: 5000};
const mockMenus = [mockMenu1, mockMenu2, mockMenu3];
const mockPartyState: PartyState = {
  id: 1,
  phase: 4,
  restaurantVotes: [], // User's id, Restaurant's id
  restaurantId: 2,
  memberIds: [1, 10],
  paidUserId: 10,
  menuEntries: [mockMenuEntry1, mockMenuEntry2, mockMenuEntry3],
};

describe('PartyPaymentComponent', () => {
  let component: PartyPaymentComponent;
  let fixture: ComponentFixture<PartyPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyPaymentComponent);
    component = fixture.componentInstance;
    component.party = mockParty;
    component.partyState = mockPartyState;
    component.user = mockUser;
    component.menus = mockMenus;
    component.myMenus = [];
    component.totalCost = 0;
    fixture.detectChanges();
  });

  it('ngOnInit should return immediately when partyState is undefined', () => {
    fixture = TestBed.createComponent(PartyPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('when menus is undefined getMenuPriceById, getMenuNameById return 0, empty string', () => {
    component.menus = undefined;
    expect(component.getMenuPriceById(1)).toBe(0);
    expect(component.getMenuNameById(1)).toBe('');
  });

  it('when there is no menu what I want to find getMenuPriceById, getMenuNameById return 0, empty string', () => {
    expect(component.getMenuPriceById(1)).toBe(0);
    expect(component.getMenuNameById(1)).toBe('');
  });

  it('checking totalCost & myMenus', () => {
    expect(component.totalCost).toEqual(25000);
    expect(component.myMenus[0]).toEqual([20, 20000, 0.5]);
  });

  it('toFinish emits event with no parameter', () => {
    component.toNextState.subscribe(_ => {
      expect(_).toEqual(undefined);
    });
    component.toFinish();
  });
});
