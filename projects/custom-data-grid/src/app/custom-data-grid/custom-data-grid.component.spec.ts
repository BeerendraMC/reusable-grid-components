import { DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, SimpleChange, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { ColumnType, GridConfig } from '../models';
import { CustomDataGridComponent } from './custom-data-grid.component';

@Component({
  template: `
    <app-custom-data-grid
      [gridConfig]="gridConfig"
      [displayedColumns]="columns"
      [dataSource]="mockData"
    ></app-custom-data-grid>

    <ng-template #actionsTemplate let-rowData>
      <button mat-button (click)="onActionClick(rowData)">Action</button>
    </ng-template>
  `
})
class TestWrapperComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate!: TemplateRef<any>;
  gridConfig!: GridConfig[];
  mockData: any[] = [{ id: 1 }];
  columns: string[] = ['actions'];
  clickedRowData!: any;

  ngOnInit(): void {
    this.gridConfig = [
      {
        name: 'actions',
        label: 'Actions',
        columnType: ColumnType.CustomTemplate,
        customTemplate: this.actionsTemplate
      }
    ];
  }

  onActionClick(data: any): void {
    this.clickedRowData = data;
  }
}

describe('CustomDataGridComponent - TestWrapperComponent', () => {
  let component: TestWrapperComponent;
  let loader: HarnessLoader;
  let fixture: ComponentFixture<TestWrapperComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatSelectModule,
        MatPaginatorModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      declarations: [CustomDataGridComponent, TestWrapperComponent],
      providers: [
        {
          provide: DatePipe,
          useValue: {
            datePipe: jasmine.createSpy('datePipe')
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(TestWrapperComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should test customTemplate', async () => {
    const table = await loader.getHarness(MatTableHarness);
    const actionBtn = await table.getHarness(MatButtonHarness);
    expect(component.clickedRowData).toBeUndefined();
    await actionBtn.click();
    expect(component.clickedRowData).toEqual({ id: 1 });
  });
});

describe('CustomDataGridComponent', () => {
  let component: CustomDataGridComponent;
  let loader: HarnessLoader;
  let fixture: ComponentFixture<CustomDataGridComponent>;
  const mockGridConfiguration: GridConfig[] = [
    { name: 'id', label: 'Id', columnType: ColumnType.Text },
    { name: 'name', label: 'Name', columnType: ColumnType.Link, sort: true },
    {
      name: 'gender',
      label: 'Gender',
      columnType: ColumnType.Dropdown,
      dropdownValues: [
        { value: 'male', viewValue: 'Male' },
        { value: 'female', viewValue: 'Female' }
      ]
    }
  ];
  const mockDisplayedColumns = ['id', 'name', 'gender'];
  const mockGridData = [
    { id: 1, name: 'Beerendra M C', gender: 'male' },
    { id: 2, name: 'Manju D R', gender: 'male' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatSelectModule,
        MatInputModule,
        MatPaginatorModule,
        NoopAnimationsModule
      ],
      declarations: [CustomDataGridComponent],
      providers: [{ provide: DatePipe }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(CustomDataGridComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource = mockGridData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test defaultSortColumn, verticalScrollOffsetInRows and requirePagination input properties', async () => {
    component.defaultSortColumn = { name: 'name', sortDirection: 'desc' };
    component.verticalScrollOffsetInRows = 1;
    component.requirePagination = false;
    component.ngOnInit();
    component.ngOnChanges({
      defaultSortColumn: new SimpleChange(null, { name: 'name', sortDirection: 'desc' }, true),
      verticalScrollOffsetInRows: new SimpleChange(null, 1, true),
      requirePagination: new SimpleChange(null, false, true),
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    await fixture.whenStable();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    loader.getHarness(MatPaginatorHarness).catch(err => {
      expect(err).toBeDefined();
    });
    const firstRowCells = await rows[0].getCells();
    const firstRowCellTexts = await parallel(() => firstRowCells.map(cell => cell.getText()));
    expect(firstRowCellTexts).toEqual([mockGridData[1].id.toString(), mockGridData[1].name, 'Male']);
    expect(component.sort.active).toEqual('name');
    expect(component.sort.direction).toEqual('desc');
    expect(component.tableScrollStyle).toEqual({
      'max-height': `${56 * 2}px`,
      'overflow-y': 'auto'
    });
  });

  it('should test noDataMessage input properties', async () => {
    component.noDataMessage = 'No data available';
    component.dataSource = [];
    component.ngOnChanges({
      dataSource: new SimpleChange(null, [], true)
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const msgDiv = document.querySelector('.no-data-message') as HTMLElement;
    expect(msgDiv.innerText).toEqual('No data available');
  });

  it('should test searchOption input property', async () => {
    loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' })).catch(err => {
      expect(err).toBeDefined();
    });
    component.searchOption = {
      onColumn: 'name',
      searchTextBoxLabel: 'Search by name'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by name');
    await searchInput?.setValue('manju');
    const table = await loader.getHarness(MatTableHarness);
    let rows = await table.getRows();
    expect(rows.length).toBe(1);
    const cells = await rows[0].getCells();
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual([mockGridData[1].id.toString(), mockGridData[1].name, 'Male']);
    await searchInput?.setValue('xyz');
    rows = await table.getRows();
    expect(rows.length).toBe(0);
  });

  it('should test search functionality on LinkAndDescription columnType', async () => {
    component.gridConfig = mockGridConfiguration.map((x, i) => {
      return i === 1 ? { ...x, columnType: ColumnType.LinkAndDescription } : { ...x };
    });
    const mockData = (component.dataSource = mockGridData.map(x => ({
      ...x,
      name: {
        Link: x.name,
        Description: 'dummy description',
        SearchSortField: 'Link'
      }
    })));
    component.searchOption = {
      onColumn: 'name',
      searchTextBoxLabel: 'Search by name'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by name');
    await searchInput?.setValue('beerendra');
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBe(1);
    const cells = await rows[0].getCells();
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts[0]).toEqual(mockGridData[0].id.toString());
  });

  it('should test search functionality on Date columnType', inject([DatePipe], async (datePipe: DatePipe) => {
    component.gridConfig = [
      ...mockGridConfiguration,
      {
        name: 'dob',
        label: 'DOB',
        columnType: ColumnType.Date
      }
    ];
    component.displayedColumns = [...mockDisplayedColumns, 'dob'];
    const mockData = (component.dataSource = mockGridData.map((x, i) => ({
      ...x,
      dob: i === 0 ? new Date('1997/11/06') : new Date('1996/03/08')
    })));
    component.searchOption = {
      onColumn: 'dob',
      searchTextBoxLabel: 'Search by dob'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by dob');
    await searchInput?.setValue('1997');
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBe(1);
    const cells = await rows[0].getCells();
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    const transformedDate = datePipe.transform(new Date('1997/11/06')) as string;
    expect(cellTexts).toEqual([mockGridData[0].id.toString(), mockGridData[0].name, 'Male', transformedDate]);
  }));

  it('should test search functionality on two columns (both of type Text)', async () => {
    component.searchOption = {
      onTwoColumns: ['name', 'gender'],
      searchTextBoxLabel: 'Search by name or gender'
    };
    const mockData = (component.dataSource = mockGridData.map((x, i) => ({
      ...x,
      gender: i === 0 ? 'male' : 'female'
    })));
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by name or gender');

    // search by name
    await searchInput?.setValue('beerendra');
    const table = await loader.getHarness(MatTableHarness);
    let rows = await table.getRows();
    expect(rows.length).toBe(1);
    let cells = await rows[0].getCells();
    let cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual([mockGridData[0].id.toString(), mockGridData[0].name, 'Male']);

    // search by gender
    await searchInput?.setValue('female');
    rows = await table.getRows();
    expect(rows.length).toBe(1);
    cells = await rows[0].getCells();
    cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual([mockGridData[1].id.toString(), mockGridData[1].name, 'Female']);
  });

  it('should test search functionality on two columns (both of type Date)', inject(
    [DatePipe],
    async (datePipe: DatePipe) => {
      component.gridConfig = [
        { name: 'dob', label: 'DOB', columnType: ColumnType.Date },
        { name: 'doj', label: 'DOJ', columnType: ColumnType.Date }
      ];
      const mockData = (component.dataSource = [
        { dob: new Date('1997/11/06'), doj: new Date('2018/06/13') },
        { dob: new Date('1996/03/08'), doj: new Date('2019/11/10') }
      ]);
      component.displayedColumns = ['dob', 'doj'];
      component.searchOption = {
        onTwoColumns: ['dob', 'doj'],
        searchTextBoxLabel: 'Search by dob or doj'
      };
      component.ngOnChanges({
        dataSource: new SimpleChange(null, mockData, true)
      });
      const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
      const searchInput = await formField.getControl(MatInputHarness);
      expect(await formField.getLabel()).toEqual('Search by dob or doj');

      // search by dob
      await searchInput?.setValue('1997');
      const table = await loader.getHarness(MatTableHarness);
      let rows = await table.getRows();
      expect(rows.length).toBe(1);
      let cells = await rows[0].getCells();
      let cellTexts = await parallel(() => cells.map(cell => cell.getText()));
      let transformedDob = datePipe.transform(new Date('1997/11/06')) as string;
      let transformedDoj = datePipe.transform(new Date('2018/06/13')) as string;
      expect(cellTexts).toEqual([transformedDob, transformedDoj]);

      // search by doj
      await searchInput?.setValue('2019');
      rows = await table.getRows();
      expect(rows.length).toBe(1);
      cells = await rows[0].getCells();
      cellTexts = await parallel(() => cells.map(cell => cell.getText()));
      transformedDob = datePipe.transform(new Date('1996/03/08')) as string;
      transformedDoj = datePipe.transform(new Date('2019/11/10')) as string;
      expect(cellTexts).toEqual([transformedDob, transformedDoj]);
    }
  ));

  it('should test search functionality on two columns (both of type LinkAndDescription)', async () => {
    component.gridConfig = [
      {
        name: 'name',
        label: 'Name',
        columnType: ColumnType.LinkAndDescription
      },
      {
        name: 'designation',
        label: 'Designation',
        columnType: ColumnType.LinkAndDescription
      }
    ];
    const mockData = (component.dataSource = [
      {
        name: {
          Link: 'Beerendra',
          Description: 'xxxx',
          SearchSortField: 'Link'
        },
        designation: {
          Link: 'SE',
          Description: 'xxxx',
          SearchSortField: 'Link'
        }
      },
      {
        name: { Link: 'Manju', Description: 'xxxx', SearchSortField: 'Link' },
        designation: {
          Link: 'JSE',
          Description: 'xxxx',
          SearchSortField: 'Link'
        }
      }
    ]);
    component.displayedColumns = ['name', 'designation'];
    component.searchOption = {
      onTwoColumns: ['name', 'designation'],
      searchTextBoxLabel: 'Search by name or designation'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by name or designation');

    // search by name
    await searchInput?.setValue('beerendra');
    const table = await loader.getHarness(MatTableHarness);
    let rows = await table.getRows();
    expect(rows.length).toBe(1);
    let cells = await rows[0].getCells();
    expect(await cells[0].getText()).toContain('Beerendra');

    // search by designation
    await searchInput?.setValue('JSE');
    rows = await table.getRows();
    expect(rows.length).toBe(1);
    cells = await rows[0].getCells();
    expect(await cells[0].getText()).toContain('Manju');
  });

  it('should test global search functionality', async () => {
    component.searchOption = {
      onColumn: 'globalFilter',
      searchTextBoxLabel: 'Global search'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Global search');

    // search by name
    await searchInput?.setValue('beerendra');
    const table = await loader.getHarness(MatTableHarness);
    let rows = await table.getRows();
    expect(rows.length).toBe(1);
    let cells = await rows[0].getCells();
    let cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual([mockGridData[0].id.toString(), mockGridData[0].name, 'Male']);

    // search by id
    await searchInput?.setValue('2');
    rows = await table.getRows();
    expect(rows.length).toBe(1);
    cells = await rows[0].getCells();
    cellTexts = await parallel(() => cells.map(cell => cell.getText()));
    expect(cellTexts).toEqual([mockGridData[1].id.toString(), mockGridData[1].name, 'Male']);
  });

  it('should test global search functionality when grid contains null data', async () => {
    component.gridConfig = [
      ...mockGridConfiguration.map((x, i) => {
        return i === 1 ? { ...x, columnType: ColumnType.LinkAndDescription } : { ...x };
      }),
      {
        name: 'dob',
        label: 'DOB',
        columnType: ColumnType.Date
      }
    ];
    component.displayedColumns = [...mockDisplayedColumns, 'dob'];
    const mockData = (component.dataSource = [
      ...mockGridData.map((x, i) => ({
        ...x,
        name: {
          Link: x.name,
          Description: 'dummy description',
          SearchSortField: 'Link'
        },
        dob: i === 0 ? new Date('1997/11/06') : new Date('1996/03/08')
      })),
      {
        id: null,
        name: { Link: null, Description: null, SearchSortField: 'Link' },
        gender: null,
        dob: null
      }
    ]);
    component.searchOption = {
      onColumn: 'globalFilter',
      searchTextBoxLabel: 'Global search'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Global search');

    // search by name
    await searchInput?.setValue('beerendra');
    const table = await loader.getHarness(MatTableHarness);
    let rows = await table.getRows();
    expect(rows.length).toBe(1);
    let cells = await rows[0].getCells();
    expect(await cells[0].getText()).toEqual(mockGridData[0].id.toString());

    // search by dob
    await searchInput?.setValue('1997');
    rows = await table.getRows();
    expect(rows.length).toBe(1);
    cells = await rows[0].getCells();
    expect(await cells[0].getText()).toEqual(mockGridData[0].id.toString());

    // search by id
    await searchInput?.setValue('2');
    rows = await table.getRows();
    expect(rows.length).toBe(1);
    cells = await rows[0].getCells();
    expect(await cells[0].getText()).toEqual(mockGridData[1].id.toString());
  });

  it('should test search functionality on two columns when they have null values', async () => {
    const mockData = (component.dataSource = [...mockGridData, { id: null, name: null, gender: null }]);
    component.searchOption = {
      onTwoColumns: ['id', 'name'],
      searchTextBoxLabel: 'Search by id or name'
    };
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by id or name');

    // search by id
    await searchInput?.setValue('2');
    const table = await loader.getHarness(MatTableHarness);
    let rows = await table.getRows();
    expect(rows.length).toBe(1);
    let cells = await rows[0].getCells();
    expect(await cells[0].getText()).toEqual('2');

    // search by name
    await searchInput?.setValue('beerendra');
    rows = await table.getRows();
    expect(rows.length).toBe(1);
    cells = await rows[0].getCells();
    expect(await cells[1].getText()).toContain('Beerendra');
  });

  it('should test sort functionality on Date columnType', inject([DatePipe], async (datePipe: DatePipe) => {
    component.gridConfig = [
      ...mockGridConfiguration,
      {
        name: 'dob',
        label: 'DOB',
        columnType: ColumnType.Date,
        sort: true
      }
    ];
    component.displayedColumns = [...mockDisplayedColumns, 'dob'];
    const mockData = (component.dataSource = mockGridData.map((x, i) => ({
      ...x,
      dob: i === 0 ? new Date('1997/11/06') : new Date('1996/03/08')
    })));
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const sort = await loader.getHarness(MatSortHarness);
    const sortHeader = (await sort.getSortHeaders())[3];
    await sortHeader.click();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    const firstRowCells = await rows[0].getCells();
    const firstRowCellTexts = await parallel(() => firstRowCells.map(cell => cell.getText()));
    const transformedDate = datePipe.transform(new Date('1996/03/08')) as string;
    expect(firstRowCellTexts).toEqual([mockGridData[1].id.toString(), mockGridData[1].name, 'Male', transformedDate]);
  }));

  it('should test sort functionality on LinkAndDescription columnType', async () => {
    component.gridConfig = mockGridConfiguration.map((x, i) => {
      return i === 1 ? { ...x, columnType: ColumnType.LinkAndDescription, sort: true } : { ...x };
    });
    const mockData = (component.dataSource = mockGridData.map(x => ({
      ...x,
      name: {
        Link: x.name,
        Description: 'dummy description',
        SearchSortField: 'Link'
      }
    })));
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const sort = await loader.getHarness(MatSortHarness);
    const sortHeader = (await sort.getSortHeaders())[1];
    await sortHeader.click();
    await sortHeader.click();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    const firstRowCells = await rows[0].getCells();
    const firstRowCellTexts = await parallel(() => firstRowCells.map(cell => cell.getText()));
    expect(firstRowCellTexts[0]).toEqual(mockGridData[1].id.toString());
  });

  it('should test sort functionality on column having null value', async () => {
    const mockData = (component.dataSource = [...mockGridData, { id: null, name: null, gender: null }]);
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockData, true)
    });
    const sort = await loader.getHarness(MatSortHarness);
    const sortHeader = (await sort.getSortHeaders())[1];
    await sortHeader.click();
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    const firstRowCells = await rows[0].getCells();
    const firstRowCellTexts = await parallel(() => firstRowCells.map(cell => cell.getText()));
    expect(firstRowCellTexts[0]).toBeFalsy();
  });

  it('should test the table', async () => {
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    const table = await loader.getHarness(MatTableHarness);
    const headerRows = await table.getHeaderRows();
    const rows = await table.getRows();
    expect(headerRows.length).toBe(1);
    expect(rows.length).toBe(2);

    const headerRowCells = await headerRows[0].getCells();
    const headerRowCellTexts = await parallel(() => headerRowCells.map(cell => cell.getText()));
    expect(headerRowCellTexts).toEqual([
      mockGridConfiguration[0].label,
      mockGridConfiguration[1].label,
      mockGridConfiguration[2].label
    ]);

    const firstRowCells = await rows[0].getCells();
    const firstRowCellTexts = await parallel(() => firstRowCells.map(cell => cell.getText()));
    expect(firstRowCellTexts).toEqual([mockGridData[0].id.toString(), mockGridData[0].name, 'Male']);

    const secondRowCells = await rows[1].getCells();
    const secondRowCellTexts = await parallel(() => secondRowCells.map(cell => cell.getText()));
    expect(secondRowCellTexts).toEqual([mockGridData[1].id.toString(), mockGridData[1].name, 'Male']);
  });

  it('should test linkClick output event', async () => {
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    fixture.detectChanges();
    await fixture.whenStable();
    component.linkClick.subscribe((rowData: any) => {
      expect(rowData).toBe(mockGridData[0]);
    });
    const firstLink = fixture.nativeElement.querySelectorAll('tr a')[0];
    firstLink.click();
    fixture.detectChanges();
  });

  it('should test selectionChange output event', async () => {
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    component.selectionChange.subscribe((data: any) => {
      expect(data?.element).toBe(mockGridData[0]);
      expect(data?.selectedValue).toBe('female');
    });
    const table = await loader.getHarness(MatTableHarness);
    const select = await table.getHarness(MatSelectHarness);
    await select.open();
    await select.clickOptions({ text: 'Female' });
  });

  it('should test isStickyHeader method', () => {
    expect(component.isStickyHeader()).toBeFalse();
    component.verticalScrollOffsetInRows = 1;
    component.requirePagination = false;
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    expect(component.isStickyHeader()).toBeTrue();

    component.requirePagination = true;
    component.ngOnChanges({
      dataSource: new SimpleChange(null, mockGridData, true)
    });
    expect(component.isStickyHeader()).toBeTrue();
  });

  it('should test getColumnAlignClass method', () => {
    expect(component.getColumnAlignClass('right', 'td')).toEqual('td-right');
    expect(component.getColumnAlignClass('', 'td')).toEqual('');
  });
});
