import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVoteObjectComponent } from './add-vote-object.component';

describe('AddVoteObjectComponent', () => {
  let component: AddVoteObjectComponent;
  let fixture: ComponentFixture<AddVoteObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVoteObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVoteObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
