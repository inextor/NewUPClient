import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUsersComponent } from './import-users.component';

describe('ImportUsersComponent', () => {
  let component: ImportUsersComponent;
  let fixture: ComponentFixture<ImportUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
