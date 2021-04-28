import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IEmployee } from './models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  baseUrl = 'api/';

  constructor(private http: HttpClient) {}

  getEmployees(
    filter: string,
    sortColumn: string,
    sortDirection: string,
    pageIndex: number,
    pageSize: number
  ): Observable<IEmployee[]> {
    const params = new HttpParams()
      .set('filter', filter)
      .set('sortColumn', sortColumn)
      .set('sortOrder', sortDirection)
      .set('pageNumber', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    return this.http
      .get<IEmployee[]>(`${this.baseUrl}employees`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(errorResponse: HttpErrorResponse): Observable<any> {
    return throwError(errorResponse);
  }
}
