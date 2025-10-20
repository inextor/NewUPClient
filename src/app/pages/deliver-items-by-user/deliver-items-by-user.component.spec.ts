import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverItemsComponent } from './deliver-items.component';

describe('DeliverItemsComponent', () => {
  let component: DeliverItemsComponent;
  let fixture: ComponentFixture<DeliverItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliverItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
