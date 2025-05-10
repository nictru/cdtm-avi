import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestioningTypeSelectorComponent } from './questioning-type-selector.component';

describe('QuestioningTypeSelectorComponent', () => {
  let component: QuestioningTypeSelectorComponent;
  let fixture: ComponentFixture<QuestioningTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestioningTypeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestioningTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
