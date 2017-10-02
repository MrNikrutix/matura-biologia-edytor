import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoEditorComponent } from './repo-editor.component';

describe('RepoEditorComponent', () => {
  let component: RepoEditorComponent;
  let fixture: ComponentFixture<RepoEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepoEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
