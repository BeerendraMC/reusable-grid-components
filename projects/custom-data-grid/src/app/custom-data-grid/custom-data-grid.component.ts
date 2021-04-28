import { Component, OnChanges, Input, ViewChild, Output, EventEmitter, SimpleChanges, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { ColumnType, GridConfig } from '../models';

/**
 * A configurable and re-usable grid component built on Angular Material data table
 * https://material.angular.io/components/table/overview
 */
@Component({
  selector: 'app-custom-data-grid',
  templateUrl: './custom-data-grid.component.html',
  styleUrls: ['./custom-data-grid.component.scss']
})
export class CustomDataGridComponent implements OnInit, OnChanges {
  /** Main grid configuration array, where each object represents the configurations of one column. */
  @Input() gridConfig!: GridConfig[];

  /** The set of columns to be displayed. */
  @Input() displayedColumns!: string[];

  /** The table's source of data. */
  @Input() dataSource!: Array<any>;

  /** Optional default sort column details - name and sort direction. */
  @Input() defaultSortColumn?: { name: string; sortDirection: SortDirection };

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
   * Optional filter option details.
   * To have the global filter, set onColumn: 'globalFilter'.
   */
  @Input() searchOption?: {
    onColumn?: string;
    onTwoColumns?: string[];
    searchTextBoxLabel: string;
    searchBoxStyle?: {};
  };

  /**
   * The message to be displayed when there is no data.
   * Defaults to 'No data available.'.
   */
  @Input() noDataMessage = 'No data available.';

  /**
   * The flag to turn pagination on or off.
   * Defaults to on.
   */
  @Input() requirePagination = true;

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

  /** Reference to the MatPaginator. */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Reference to the MatSort. */
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  gridDataSource: MatTableDataSource<any>;
  tableScrollStyle!: {};
  private sortState!: Sort;

  get ColumnType(): any {
    return ColumnType;
  }

  constructor(private datePipe: DatePipe) {
    this.gridDataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    if (this.requirePagination) {
      // If the user changes the sort order, reset back to the first page.
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.verticalScrollOffsetInRows &&
      changes.verticalScrollOffsetInRows.firstChange &&
      this.verticalScrollOffsetInRows
    ) {
      const maxHeight = 56 * (this.verticalScrollOffsetInRows + 1);
      this.tableScrollStyle = {
        'max-height': `${maxHeight}px`,
        'overflow-y': 'auto'
      };
    }
    if (changes.defaultSortColumn && changes.defaultSortColumn.firstChange && this.defaultSortColumn) {
      this.sortState = {
        active: this.defaultSortColumn.name,
        direction: this.defaultSortColumn.sortDirection
      };
      this.sort.active = this.sortState.active;
      this.sort.direction = this.sortState.direction;
    }
    if (changes.dataSource && changes.dataSource.currentValue) {
      this.gridDataSource.data = this.dataSource;
      this.gridDataSource.sort = this.sort;
      if (this.requirePagination) {
        this.gridDataSource.paginator = this.paginator;
      }
      this.gridDataSource.sortingDataAccessor = (data: any, property: string) => {
        if (!data[property]) {
          return null;
        }
        if (typeof data[property] === 'string') {
          return data[property].toLowerCase();
        } else if (typeof data[property] === 'object' && typeof data[property].getDate !== 'function') {
          const dataObj = data[property];
          return dataObj[dataObj.SearchSortField] ? (dataObj[dataObj.SearchSortField] as string).toLowerCase() : null;
        }
        return data[property];
      };
      if (this.sortState) {
        this.sort.sortChange.emit(this.sortState);
      }
      if (this.searchOption) {
        this.gridDataSource.filterPredicate =
          this.searchOption.onColumn === 'globalFilter'
            ? this.customGlobalFilterPredicate()
            : this.customFilterPredicate();
      }
    }
  }

  /**
   * Applies filter by filtering the grid data
   * @param event keyup event
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.gridDataSource.filter = filterValue.trim().toLowerCase();

    if (this.gridDataSource.paginator) {
      this.gridDataSource.paginator.firstPage();
    }
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

  /** Searches the filter string in different types of data and returns boolean. */
  isSearchTermMatched(data: any, filter: string): boolean {
    let returnValue: boolean;
    if (!data || !filter) {
      returnValue = false;
    } else if (data instanceof Date) {
      returnValue = this.datePipe.transform(data)?.toLowerCase().indexOf(filter) !== -1;
    } else if (typeof data === 'object') {
      returnValue = data[data.SearchSortField]
        ? (data[data.SearchSortField] as string).toLowerCase().indexOf(filter) !== -1
        : false;
    } else {
      returnValue = data.toString().toLowerCase().indexOf(filter) !== -1;
    }
    return returnValue;
  }

  /**
   * Returns a custom filter predicate function which lets us filter gird data by one or two columns
   * @returns filterPredicate
   */
  customFilterPredicate(): (data: any, filter: string) => boolean {
    const myFilterPredicate = (data: any, filter: string) => {
      let isMatched = false;
      if (this.searchOption?.onColumn) {
        isMatched = this.isSearchTermMatched(data[this.searchOption.onColumn], filter);
      } else if (this.searchOption?.onTwoColumns && this.searchOption.onTwoColumns.length > 1) {
        const onTwoColumnsData = [data[this.searchOption.onTwoColumns[0]], data[this.searchOption.onTwoColumns[1]]];
        if (!onTwoColumnsData[0]) {
          isMatched = this.isSearchTermMatched(onTwoColumnsData[1], filter);
        } else if (!onTwoColumnsData[1]) {
          isMatched = this.isSearchTermMatched(onTwoColumnsData[0], filter);
        } else {
          // tslint:disable-next-line: one-variable-per-declaration
          let dataObj0, dataObj1;
          if (onTwoColumnsData[0] instanceof Date && onTwoColumnsData[1] instanceof Date) {
            isMatched =
              this.datePipe.transform(onTwoColumnsData[0])?.toLowerCase().indexOf(filter) !== -1 ||
              this.datePipe.transform(onTwoColumnsData[1])?.toLowerCase().indexOf(filter) !== -1;
          } else if (onTwoColumnsData[0] instanceof Date && typeof onTwoColumnsData[1] === 'object') {
            dataObj1 = onTwoColumnsData[1];
            isMatched =
              this.datePipe.transform(onTwoColumnsData[0])?.toLowerCase().indexOf(filter) !== -1 ||
              (dataObj1[dataObj1.SearchSortField]
                ? (dataObj1[dataObj1.SearchSortField] as string).toLowerCase().indexOf(filter) !== -1
                : false);
          } else if (typeof onTwoColumnsData[0] === 'object' && onTwoColumnsData[1] instanceof Date) {
            dataObj0 = onTwoColumnsData[0];
            isMatched =
              (dataObj0[dataObj0.SearchSortField]
                ? (dataObj0[dataObj0.SearchSortField] as string).toLowerCase().indexOf(filter) !== -1
                : false) || this.datePipe.transform(onTwoColumnsData[1])?.toLowerCase().indexOf(filter) !== -1;
          } else if (typeof onTwoColumnsData[0] === 'object' && typeof onTwoColumnsData[1] === 'object') {
            dataObj0 = onTwoColumnsData[0];
            dataObj1 = onTwoColumnsData[1];
            isMatched =
              (dataObj0[dataObj0.SearchSortField]
                ? (dataObj0[dataObj0.SearchSortField] as string).toLowerCase().indexOf(filter) !== -1
                : false) ||
              (dataObj1[dataObj1.SearchSortField]
                ? (dataObj1[dataObj1.SearchSortField] as string).toLowerCase().indexOf(filter) !== -1
                : false);
          } else {
            isMatched =
              onTwoColumnsData[0].toString().toLowerCase().indexOf(filter) !== -1 ||
              onTwoColumnsData[1].toString().toLowerCase().indexOf(filter) !== -1;
          }
        }
      }

      return isMatched;
    };

    return myFilterPredicate;
  }

  /** Recursive function to fetch SearchSortField value of the object for global filter */
  nestedFilterCheck(search: string, data: any, key: string): string {
    if (!data[key]) {
      search += '';
    } else if (data[key] instanceof Date) {
      search += this.datePipe.transform(data[key])?.toLowerCase();
    } else if (typeof data[key] === 'object') {
      search = this.nestedFilterCheck(search, data[key], data[key].SearchSortField);
      /**
       * Use below logic to reduce all the object values and to search by all the fields of the objects.
       * for (const k in data[key]) {
       *   if (data[key][k] !== null) {
       *     search = this.nestedFilterCheck(search, data[key], k);
       *   }
       * }
       */
    } else {
      search += data[key];
    }
    return search;
  }

  /**
   * Returns a custom global filter predicate function which lets us filter gird data globally.
   * @returns filterPredicate.
   */
  customGlobalFilterPredicate(): (data: any, filter: string) => boolean {
    const myFilterPredicate = (data: any, filter: string) => {
      const accumulator = (currentTerm: string, key: string) => {
        return this.nestedFilterCheck(currentTerm, data, key);
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };

    return myFilterPredicate;
  }

  /**
   * Returns boolean flag which indicates whether the table headers should be sticky or not.
   * @returns boolean.
   */
  isStickyHeader(): boolean {
    if (this.gridDataSource && this.verticalScrollOffsetInRows) {
      return (
        (this.gridDataSource?.paginator?.pageSize ?? 0) > this.verticalScrollOffsetInRows ||
        (!this.requirePagination && this.dataSource?.length > this.verticalScrollOffsetInRows)
      );
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
