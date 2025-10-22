import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInformativoComponent } from './panel-informativo.component';

describe('PanelInformativoComponent', () => {
  let component: PanelInformativoComponent;
  let fixture: ComponentFixture<PanelInformativoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelInformativoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelInformativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
