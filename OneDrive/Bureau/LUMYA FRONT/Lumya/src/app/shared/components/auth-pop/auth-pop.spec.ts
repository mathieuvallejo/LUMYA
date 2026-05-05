import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPop } from './auth-pop';

describe('AuthPop', () => {
  let component: AuthPop;
  let fixture: ComponentFixture<AuthPop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPop],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
