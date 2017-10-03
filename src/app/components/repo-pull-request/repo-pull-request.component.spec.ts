import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoPullRequestComponent } from './repo-pull-request.component';

describe('RepoPullRequestComponent', () => {
  let component: RepoPullRequestComponent;
  let fixture: ComponentFixture<RepoPullRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepoPullRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoPullRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
