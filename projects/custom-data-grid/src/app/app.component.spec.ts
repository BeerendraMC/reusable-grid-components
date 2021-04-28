import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { EmployeeService } from './employee.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    const employeeService = jasmine.createSpyObj('EmployeeService', ['getEmployees']);
    await TestBed.configureTestingModule({
      providers: [{ provide: EmployeeService, useValue: employeeService }],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
