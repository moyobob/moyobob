import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PartyCreateComponent } from './party-create.component';
import { PartyService } from '../services/party.service';

describe('PartyCreateComponent', () => {
  let component: PartyCreateComponent;
  let fixture: ComponentFixture<PartyCreateComponent>;
  let partyService: jasmine.SpyObj<PartyService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const partySpy = jasmine.createSpyObj('PartyService', ['addParty']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PartyCreateComponent],
      providers: [
        { provide: PartyService, useValue: partySpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .compileComponents();

    partyService = TestBed.get(PartyService);
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
