import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GridConfig, ColumnType } from './models/custom-data-grid';
import { EmployeeService } from './employee.service';
import { IEmployee } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  gridConfiguration!: GridConfig[];
  displayedColumns!: string[];
  Employees!: IEmployee[];
  selectedEmployee!: IEmployee;
  genderChangeData: any;
  clickedEmployee!: IEmployee;
  customTemplateColumn!: string;

  @ViewChild('homeTownTemplate', { static: true })
  homeTownTemplate!: TemplateRef<any>;
  @ViewChild('actionTemplate', { static: true })
  actionTemplate!: TemplateRef<any>;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.setGridConfigs();
    this.getEmps();
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
        sort: true,
        align: 'right',
        style: { width: '15%' }
      },
      {
        name: 'email',
        label: 'Email',
        columnType: ColumnType.Text,
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

  getEmps(): void {
    this.employeeService.getEmployees().subscribe(
      (data: IEmployee[]) => {
        const empData: IEmployee[] = data.map(
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
        setTimeout(() => {
          this.Employees = empData;
        }, 2000);
      },
      err => {
        this.Employees = []; // This stops the loader and shows no data message on the grid
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
}
