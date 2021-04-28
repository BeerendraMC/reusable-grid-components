import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnType, GridConfig } from '../models';

import { CustomDataGridComponent } from './custom-data-grid.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { CustomDataSource } from './custom-datasource';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';

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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDataGridComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    component.dataSource = new CustomDataSource<any>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test verticalScrollOffsetInRows input property', async () => {
    component.verticalScrollOffsetInRows = 1;
    component.ngOnInit();
    expect(component.tableScrollStyle).toEqual({
      'max-height': `${56 * 2}px`,
      'overflow-y': 'auto'
    });
  });

  it('should test noDataMessage input properties', async () => {
    component.noDataMessage = 'No data available';
    component.dataSource.setShowNoDataMessageSubject(true);
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
      searchTextBoxLabel: 'Search by name'
    };
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by name');
  });

  it('should test the table', async () => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
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

  it('should test linkClick output event', async done => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
    fixture.detectChanges();
    await fixture.whenStable();
    component.linkClick.subscribe((rowData: any) => {
      expect(rowData).toBe(mockGridData[0]);
      done();
    });
    const firstLink = fixture.nativeElement.querySelectorAll('tr a')[0];
    firstLink.click();
    fixture.detectChanges();
  });

  it('should test selectionChange output event', async done => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
    component.selectionChange.subscribe((data: any) => {
      expect(data?.element).toBe(mockGridData[0]);
      expect(data?.selectedValue).toBe('female');
      done();
    });
    const table = await loader.getHarness(MatTableHarness);
    const select = await table.getHarness(MatSelectHarness);
    await select.open();
    await select.clickOptions({ text: 'Female' });
  });

  it('should test sortOrPageChange (sort)', async done => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
    component.sortOrPageChange.subscribe((data: Sort) => {
      expect(data.active).toEqual('name');
      expect(data.direction).toEqual('asc');
      done();
    });
    const sort = await loader.getHarness(MatSortHarness);
    const sortHeader = (await sort.getSortHeaders())[1];
    await sortHeader.click();
  });

  it('should test sortOrPageChange (paginator)', async done => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
    component.sortOrPageChange.subscribe((data: PageEvent) => {
      expect(data.pageIndex).toEqual(0);
      expect(data.pageSize).toEqual(10);
      done();
    });
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.setPageSize(10);
  });

  it('should test searchInputChange', async done => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
    component.searchOption = {
      searchTextBoxLabel: 'Search by name'
    };
    component.searchInputChange.subscribe((data: string) => {
      expect(data).toEqual('manju');
      done();
    });
    const formField = await loader.getHarness(MatFormFieldHarness.with({ selector: '.search-field' }));
    const searchInput = await formField.getControl(MatInputHarness);
    expect(await formField.getLabel()).toEqual('Search by name');
    component.ngAfterViewInit();
    await searchInput?.setValue('manju');
  });

  it('should test isStickyHeader method', () => {
    component.gridConfig = mockGridConfiguration;
    component.displayedColumns = mockDisplayedColumns;
    component.dataSource.setDataSubject(mockGridData);
    expect(component.isStickyHeader()).toBeFalse();
    component.verticalScrollOffsetInRows = 1;
    expect(component.isStickyHeader()).toBeTrue();
  });

  it('should test getColumnAlignClass method', () => {
    expect(component.getColumnAlignClass('right', 'td')).toEqual('td-right');
    expect(component.getColumnAlignClass('', 'td')).toEqual('');
  });
});
