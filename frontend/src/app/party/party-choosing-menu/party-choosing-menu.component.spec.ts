import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { PartyChoosingMenuComponent } from './party-choosing-menu.component';

import { Menu } from '../../types/menu';
import { PartyState, MenuEntryCreateRequest } from '../../types/party';

const mockUser = { id: 1, email: 'ferris@rustaceans.org', username: 'ferris' };

const mockMenuEntry1 = { id: 1, menuId: 1, quantity: 2, userIds: [1] };
const mockMenuEntry2 = { id: 2, menuId: 2, quantity: 2, userIds: [1, 2] };
const mockMenuEntry3 = { id: 3, menuId: 3, quantity: 1, userIds: [2] };

const mockMenu1 = { id: 1, name: 'Mock Menu 1', price: -120 };

const mockPartyState: PartyState = {
  id: 1,
  phase: 0,
  restaurantId: null,
  memberIds: [],
  menuEntries: [mockMenuEntry1, mockMenuEntry2]
};

@Component({ selector: 'app-select-menu', template: '' })
class MockSelectMenuComponent {
  @Input() menus: Menu[];
  @Input() loggedInUserId: number;
  @Output() request: EventEmitter<MenuEntryCreateRequest>;
  @Output() cancel: EventEmitter<void>;
}

describe('PartyChoosingMenuComponent', () => {
  let component: PartyChoosingMenuComponent;
  let fixture: ComponentFixture<PartyChoosingMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PartyChoosingMenuComponent,
        MockSelectMenuComponent,
      ],
      imports: [
        HttpClientModule,
      ],
    })
      .compileComponents();
  }));

  it('should not update menu when not preloaded', () => {
    fixture = TestBed.createComponent(PartyChoosingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyChoosingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.partyState = mockPartyState;
    component.menus = [mockMenu1];
    component.user = mockUser;
    component.ngOnChanges({
      partyState: new SimpleChange(undefined, mockPartyState, true),
      menus: new SimpleChange(undefined, [mockMenu1], true),
      user: new SimpleChange(undefined, mockUser, true),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('have menu entries', () => {
    expect(component.menuEntries).toEqual(mockPartyState.menuEntries);
  });

  it('getMenuNameById should return name if exist', () => {
    expect(component.getMenuNameById(1)).toEqual(mockMenu1.name);
  });

  it('getMenuNameById should return empty string if not exist', () => {
    expect(component.getMenuNameById(2)).toEqual('');
  });

  it('toggleAddMenu should toggle showAddMenuDialog', () => {
    component.showAddMenuDialog = true;
    component.toggleAddMenu();
    expect(component.showAddMenuDialog).toBeFalsy();

    component.showAddMenuDialog = false;
    component.toggleAddMenu();
    expect(component.showAddMenuDialog).toBeTruthy();
  });

  it('cancelAddMenu should set showAddMenuDialog to false', () => {
    component.showAddMenuDialog = true;
    component.cancelAddMenu(undefined);
    expect(component.showAddMenuDialog).toBeFalsy();
  });

  it('requestAddMenu should set showAddMenuDialog to false and request', async((done) => {
    const mockRequest = {
      menuId: 2,
      quantity: 1,
      users: [1]
    };
    component.addMenu.toPromise().then(req => {
      expect(req).toEqual(mockRequest);
      done();
    });

    component.showAddMenuDialog = true;
    component.requestAddMenu(mockRequest);
    expect(component.showAddMenuDialog).toBeFalsy();
  }));

  it('updatePartyMenu should remove all when no people', async((done) => {
    component.updateMenu.toPromise().then(req => {
      expect(req).toEqual({
        id: mockMenuEntry1.id,
        quantityDelta: -mockMenuEntry1.quantity,
        addUserIds: [],
        removeUserIds: mockMenuEntry1.userIds
      });
      done();
    });

    component.updatePartyMenu(mockMenuEntry1, -1, true);
  }));

  it('updatePartyMenu should remove me when people and quantity', async((done) => {
    component.updateMenu.toPromise().then(req => {
      expect(req).toHaveBeenCalledWith({
        id: mockMenuEntry2.id,
        quantityDelta: -1,
        addUserIds: [],
        removeUserIds: [1]
      });
      done();
    });

    component.updatePartyMenu(mockMenuEntry2, -1, true);
  }));

  it('updatePartyMenu should add me when removing false', async((done) => {
    component.updateMenu.toPromise().then(req => {
      expect(req).toHaveBeenCalledWith({
        id: mockMenuEntry3.id,
        quantityDelta: 1,
        addUserIds: [1],
        removeUserIds: []
      });
      done();
    });

    component.updatePartyMenu(mockMenuEntry3, 1, false);
  }));

  it('isUserId should return true when I am in', () => {
    expect(component.isAssigned([3, 5, 1, 2])).toBeTruthy();
  });

  it('isUserId should return false when I am not in', () => {
    expect(component.isAssigned([7, 2, 9, 4])).toBeFalsy();
  });

});
