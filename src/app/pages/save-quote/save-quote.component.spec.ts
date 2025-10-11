import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveQuoteComponent } from './save-quote.component';

describe('SaveQuoteComponent', () => {
  let component: SaveQuoteComponent;
  let fixture: ComponentFixture<SaveQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveQuoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
