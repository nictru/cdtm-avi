import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevantDoctorsComponent } from './relevant-doctors.component';

describe('RelevantDoctorsComponent', () => {
  let component: RelevantDoctorsComponent;
  let fixture: ComponentFixture<RelevantDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelevantDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelevantDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
