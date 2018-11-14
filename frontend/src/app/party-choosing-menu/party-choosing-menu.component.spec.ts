import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyChoosingMenuComponent } from './party-choosing-menu.component';

describe('PartyChoosingMenuComponent', () => {
  let component: PartyChoosingMenuComponent;
  let fixture: ComponentFixture<PartyChoosingMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyChoosingMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyChoosingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
