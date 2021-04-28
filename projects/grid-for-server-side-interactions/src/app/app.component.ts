import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { CustomDataGridComponent } from './custom-data-grid/custom-data-grid.component';
import { CustomDataSource } from './custom-data-grid/custom-datasource';
import { EmployeeService } from './employee.service';
import { ColumnType, GridConfig } from './models';
import { IEmployee } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  gridConfiguration!: GridConfig[];
  displayedColumns!: string[];
  employeesDataSource: CustomDataSource<IEmployee> = new CustomDataSource<IEmployee>();
  selectedEmployee!: IEmployee;
  genderChangeData: any;
  clickedEmployee!: IEmployee;
  customTemplateColumn!: string;
  gridSearchInputValue = '';
  totalDataCount = 0;

  @ViewChild('employeeGrid') employeeGrid!: CustomDataGridComponent;

  @ViewChild('homeTownTemplate', { static: true })
  homeTownTemplate!: TemplateRef<any>;

  @ViewChild('actionTemplate', { static: true })
  actionTemplate!: TemplateRef<any>;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.setGridConfigs();
    this.getEmps('', 'id', 'asc', 0, 5);
  }

  setGridConfigs(): void {
    this.gridConfiguration = [
      {
        name: 'id',
        label: 'Id',
        columnType: ColumnType.Text,
        sort: true,
        style: { width: '5%' }
      },
      {
        name: 'name',
        label: 'Name',
        columnType: ColumnType.LinkAndDescription,
        sort: true,
        style: { width: '20%' }
      },
      {
        name: 'gender',
        label: 'Gender',
        columnType: ColumnType.Dropdown,
        sort: true,
        style: { width: '100px' },
        dropdownValues: [
          { value: 'male', viewValue: 'Male' },
          { value: 'female', viewValue: 'Female' }
        ]
      },
      {
        name: 'phone',
        label: 'Phone',
        columnType: ColumnType.Text,
        sort: true,
        style: { width: '10%' }
      },
      {
        name: 'dob',
        label: 'DOB',
        columnType: ColumnType.Date,
        sort: false,
        align: 'right',
        style: { width: '15%' }
      },
      {
        name: 'email',
        label: 'Email',
        columnType: ColumnType.Text,
        sort: true,
        align: 'center',
        style: { width: '15%' }
      },
      {
        name: 'homeTown',
        label: 'Home Town',
        columnType: ColumnType.CustomTemplate,
        customTemplate: this.homeTownTemplate,
        sort: true,
        style: { width: '15%' }
      },
      {
        name: 'action',
        label: 'Action',
        columnType: ColumnType.CustomTemplate,
        customTemplate: this.actionTemplate,
        sort: false,
        style: { width: '5%' }
      }
    ];

    this.displayedColumns = ['name', 'gender', 'phone', 'dob', 'email', 'homeTown', 'action'];
  }

  getEmps(filter: string, sortColumn: string, sortDirection: string, pageIndex: number, pageSize: number): void {
    this.employeesDataSource.setLoadingSubject(true);
    this.employeesDataSource.setShowNoDataMessageSubject(false);
    this.employeesDataSource.setDataSubject([]);
    this.totalDataCount = 0;
    this.employeeService.getEmployees(filter, sortColumn, sortDirection, pageIndex, pageSize).subscribe(
      (res: any) => {
        const { data, dataCount } = res;
        const empData: IEmployee[] = (data as IEmployee[]).map(
          emp =>
            ({
              id: emp.id,
              name: {
                Link: emp.name,
                Description: emp.description,
                SearchSortField: 'Link'
              },
              gender: emp.gender,
              phone: emp.phone,
              dob: emp.dob ? new Date(emp.dob) : null,
              email: emp.email,
              homeTown: { ...emp.homeTown, SearchSortField: 'name' }
            } as IEmployee)
        );
        this.employeesDataSource.setLoadingSubject(false);
        this.employeesDataSource.setDataSubject(empData);
        this.totalDataCount = dataCount;
      },
      err => {
        this.employeesDataSource.setLoadingSubject(false);
        this.employeesDataSource.setShowNoDataMessageSubject(true);
        console.error(err);
      }
    );
  }

  onNameClick(emp: IEmployee): void {
    this.selectedEmployee = emp;
  }

  onGenderChange(data: any): void {
    this.genderChangeData = data;
  }

  onHomeTownClick(data: IEmployee): void {
    this.customTemplateColumn = 'homeTown';
    this.clickedEmployee = data;
  }

  onActionClick(data: IEmployee): void {
    this.customTemplateColumn = 'action';
    this.clickedEmployee = data;
  }

  onSortOrPageChange(event: Sort | PageEvent): void {
    if ('pageIndex' in event) {
      this.getEmps(
        this.gridSearchInputValue,
        this.employeeGrid.sort.active,
        this.employeeGrid.sort.direction,
        event.pageIndex,
        event.pageSize
      );
    } else {
      this.getEmps(this.gridSearchInputValue, event.active, event.direction, 0, this.employeeGrid.paginator.pageSize);
    }
  }

  onSearchInputChange(value: string): void {
    this.gridSearchInputValue = value ? value : '';
    this.getEmps(
      this.gridSearchInputValue,
      this.employeeGrid.sort.active,
      this.employeeGrid.sort.direction,
      0,
      this.employeeGrid.paginator.pageSize
    );
  }
}
