import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToasMessageComponent } from './toas-message.component';

describe('ToasMessageComponent', () => {
  let component: ToasMessageComponent;
  let fixture: ComponentFixture<ToasMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToasMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToasMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
