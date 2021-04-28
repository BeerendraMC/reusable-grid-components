import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EmployeeService } from './employee.service';
import { IEmployee } from './models';
import { HttpErrorResponse } from '@angular/common/http';

describe('EmployeeService', () => {
  let httpTestingController: HttpTestingController;
  let service: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

    service.getEmployees('', '', '', 0, 5).subscribe(data => {
      expect(data).toEqual(testData, 'should check mock data');
    });

    const req = httpTestingController.expectOne(
      `${service.baseUrl}employees?filter=&sortColumn=&sortOrder=&pageNumber=0&pageSize=5`
    );
    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('filter')).toEqual('');
    expect(req.request.params.get('sortColumn')).toEqual('');
    expect(req.request.params.get('sortOrder')).toEqual('');
    expect(req.request.params.get('pageNumber')).toEqual('0');
    expect(req.request.params.get('pageSize')).toEqual('5');
    req.flush(testData);
  });

  it('should test 404 error', () => {
    const errorMsg = 'mock 404 error occurred';

    service.getEmployees('', '', '', 0, 5).subscribe(
      data => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404, 'status');
        expect(error.error).toEqual(errorMsg);
      }
    );

    const req = httpTestingController.expectOne(
      `${service.baseUrl}employees?filter=&sortColumn=&sortOrder=&pageNumber=0&pageSize=5`
    );
    req.flush(errorMsg, { status: 404, statusText: 'Not Found' });
  });
});
