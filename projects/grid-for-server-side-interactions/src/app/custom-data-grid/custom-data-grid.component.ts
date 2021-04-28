import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort, Sort } from '@angular/material/sort';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ColumnType, GridConfig } from '../models';
import { CustomDataSource } from './custom-datasource';

@Component({
  selector: 'app-custom-data-grid',
  templateUrl: './custom-data-grid.component.html',
  styleUrls: ['./custom-data-grid.component.scss']
})

/**
 * A configurable and re-usable grid component built on Angular Material data table
 * https://material.angular.io/components/table/overview
 */
export class CustomDataGridComponent implements OnInit, AfterViewInit {
  /** Main grid configuration array, where each object represents the configurations of a given column. */
  @Input() gridConfig!: GridConfig[];

  /** The set of columns to be displayed. */
  @Input() displayedColumns!: string[];

  /** The table's source of data. */
  @Input() dataSource!: CustomDataSource<any>;

  /**
   * Total number of data.
   * Required to show the total count in the paginator
   */
  @Input() dataCount!: number;

  /**
   * The set of provided page size options to display to the user.
   * Defaults to [5, 10, 20].
   */
  @Input() pageSizeOptions: number[] = [5, 10, 20];

  /**
   * Optional number of rows to introduce vertical scroll
   * when the user selects more number of rows than it.
   */
  @Input() verticalScrollOffsetInRows?: number;

  /**
   * Optional search option details.
   * If this value is not set search field will be hidden.
   */
  @Input() searchOption?: { searchTextBoxLabel: string; searchBoxStyle?: {} };

  /**
   * The message to be displayed when there is no data.
   * Defaults to 'No data available.'.
   */
  @Input() noDataMessage = 'No data available.';

  /**
   * Freeze first and last columns for mobile devices (max-width: 1023px).
   * Defaults to false.
   */
  @Input() freezeFirstAndLastColumns = false;

  /**
   * Event emitted when any one of the links in the grid has been clicked by the user.
   * Emits the clicked row data.
   */
  @Output() linkClick: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Event emitted when the selected value of any one of the dropdowns in the grid
   * has been changed by the user.
   * Emits an object which contains clicked row data and selected value.
   */
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Event emitted when the user sorts a column or change page size or index,
   * Emits appropriate event.
   */
  @Output() sortOrPageChange: EventEmitter<Sort | PageEvent> = new EventEmitter<Sort | PageEvent>();

  /**
   * Event emitted when the user enters search character in the search input,
   * Emits search string.
   */
  @Output()
  searchInputChange: EventEmitter<string> = new EventEmitter<string>();

  /** Reference to the MatPaginator. */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Reference to the MatSort. */
  @ViewChild(MatSort) sort!: MatSort;

  /** Reference to the search input. */
  @ViewChild('input') input!: ElementRef;

  columnType = ColumnType;
  tableScrollStyle!: {};

  constructor() {}

  ngOnInit(): void {
    if (this.verticalScrollOffsetInRows) {
      const maxHeight = 56 * (this.verticalScrollOffsetInRows + 1);
      this.tableScrollStyle = {
        'max-height': `${maxHeight}px`,
        'overflow-y': 'auto'
      };
    }
  }

  ngAfterViewInit(): void {
    if (this.searchOption) {
      fromEvent(this.input.nativeElement, 'keyup')
        .pipe(
          debounceTime(200),
          map(() => this.input.nativeElement.value as string),
          distinctUntilChanged()
        )
        .subscribe(value => {
          this.paginator.pageIndex = 0;
          this.searchInputChange.emit(value);
        });
    }

    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge<Sort, PageEvent>(this.sort.sortChange, this.paginator.page).subscribe((event: Sort | PageEvent) => {
      this.sortOrPageChange.emit(event);
    });
  }

  /**
   * Emits clicked row data.
   * @param element row data
   */
  emitClickedElement(element: any): void {
    this.linkClick.emit(element);
  }

  /**
   * Emits an object which includes selected row data and selected value.
   * @param element row data
   * @param event event of type MatSelectChange
   */
  emitSelectedElement(element: any, event: MatSelectChange): void {
    const emitData = { element, selectedValue: event.value };
    this.selectionChange.emit(emitData);
  }

  /**
   * Returns boolean flag which indicates whether the table headers should be sticky or not.
   * @returns boolean.
   */
  isStickyHeader(): boolean {
    if (this.paginator && this.verticalScrollOffsetInRows) {
      return (this.paginator?.pageSize ?? 0) > this.verticalScrollOffsetInRows;
    }
    return false;
  }

  /**
   * Returns the right column align class name.
   * @returns string
   */
  getColumnAlignClass(align: string, el: string): string {
    return align ? `${el}-${align}` : '';
  }
}
