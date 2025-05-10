import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePlacePickerComponent } from './time-place-picker.component';

describe('TimePlacePickerComponent', () => {
  let component: TimePlacePickerComponent;
  let fixture: ComponentFixture<TimePlacePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePlacePickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimePlacePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
