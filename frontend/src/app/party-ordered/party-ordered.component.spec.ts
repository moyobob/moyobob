import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyOrderedComponent } from './party-ordered.component';

describe('PartyOrderedComponent', () => {
  let component: PartyOrderedComponent;
  let fixture: ComponentFixture<PartyOrderedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyOrderedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyOrderedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
