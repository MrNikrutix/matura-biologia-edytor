import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseRepoComponent } from './choose-repo.component';

describe('ChooseRepoComponent', () => {
  let component: ChooseRepoComponent;
  let fixture: ComponentFixture<ChooseRepoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseRepoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
