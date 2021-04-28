import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { EmployeeService } from './employee.service';
import { IEmployee } from './models/employee';

describe('EmployeeService', () => {
  let httpTestingController: HttpTestingController;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    employeeService = TestBed.get(EmployeeService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(employeeService).toBeTruthy();
  });

  it('should test getEmployees', () => {
    const testData: IEmployee[] = [
      {
        id: 1,
        name: 'Sundar Pichai',
        gender: 'male',
        phone: 8562312478,
        dob: '1972/6/10',
        email: 'sundar.p@gmail.com'
      },
      {
        id: 2,
        name: 'Satya Nadella',
        gender: 'male',
        phone: 8956236985,
        dob: '1967/8/19',
        email: 'satya.n@gmail.com'
      }
    ];

    employeeService.getEmployees().subscribe(data => {
      expect(data).toEqual(testData, 'should check mock data');
    });

    const req = httpTestingController.expectOne(`${employeeService.baseUrl}employees`);
    expect(req.request.method).toEqual('GET');
    req.flush(testData);
  });

  it('should test 404 error', () => {
    const errorMsg = 'mock 404 error occurred';

    employeeService.getEmployees().subscribe(
      data => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404, 'status');
        expect(error.error).toEqual(errorMsg);
      }
    );

    const req = httpTestingController.expectOne(`${employeeService.baseUrl}employees`);
    req.flush(errorMsg, { status: 404, statusText: 'Not Found' });
  });
});
