import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverItemsByOrderComponent } from './deliver-items-by-order.component';

describe('DeliverItemsByOrderComponent', () => {
  let component: DeliverItemsByOrderComponent;
  let fixture: ComponentFixture<DeliverItemsByOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverItemsByOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliverItemsByOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
