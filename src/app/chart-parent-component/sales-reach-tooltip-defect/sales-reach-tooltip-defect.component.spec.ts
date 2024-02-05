/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SalesReachTooltipDefectComponent } from './sales-reach-tooltip-defect.component';

describe('SalesReachTooltipDefectComponent', () => {
  let component: SalesReachTooltipDefectComponent;
  let fixture: ComponentFixture<SalesReachTooltipDefectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesReachTooltipDefectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesReachTooltipDefectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
