import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestioningComponent } from './questioning.component';

describe('QuestioningComponent', () => {
  let component: QuestioningComponent;
  let fixture: ComponentFixture<QuestioningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestioningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
