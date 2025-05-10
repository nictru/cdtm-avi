import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevantDocumentsComponent } from './relevant-documents.component';

describe('RelevantDocumentsComponent', () => {
  let component: RelevantDocumentsComponent;
  let fixture: ComponentFixture<RelevantDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelevantDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelevantDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
