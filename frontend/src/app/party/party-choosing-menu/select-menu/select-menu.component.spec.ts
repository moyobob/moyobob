import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatRadioModule } from '@angular/material';

import { SelectMenuComponent } from './select-menu.component';

import { Menu } from 'src/app/types/menu';

describe('SelectMenuComponent', () => {
  let component: SelectMenuComponent;
  let fixture: ComponentFixture<SelectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatRadioModule,
        MatButtonModule,
        BrowserAnimationsModule,
      ],
      declarations: [SelectMenuComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancelRequest should emit canceled', async(() => {
    let calledCount = 0;
    component.cancel.subscribe(() => {
      calledCount += 1;
    });
    component.cancelRequest();
    fixture.whenStable().then(() => {
      expect(calledCount).toEqual(1);
    });
  }));

  it('addRequest should emit request when food and quantity', async(() => {
    component.chosenMenu = new Menu(1, 'm', 2);
    component.quantity = 2;
    component.loggedInUserId = 3;

    component.request.subscribe(req => {
      expect(req).toEqual({
        menuId: 1,
        quantity: 2,
        users: [3]
      });
    });
    component.addRequest();
  }));

  it('addRequest should not emit request without food or quantity', async(() => {
    component.request.subscribe(_ => expect(true).toBeFalsy());

    component.chosenMenu = undefined;
    component.quantity = 2;
    component.loggedInUserId = 3;
    component.addRequest();

    component.chosenMenu = new Menu(1, 'm', 2);
    component.quantity = 0;
    component.loggedInUserId = 3;
    component.addRequest();
  }));

});
