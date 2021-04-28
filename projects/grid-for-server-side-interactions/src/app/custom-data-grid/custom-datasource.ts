import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Custom Grid Data source that supports server-side interactions.
 */
export class CustomDataSource<T> implements DataSource<T> {
  /**
   * Private stream that emits when a new data array is set.
   * Initial value is empty array.
   */
  private dataSubject = new BehaviorSubject<T[]>([]);

  /**
   * Private stream that emits boolean value which toggles the loader on the grid.
   * Initial value is false.
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Private stream that emits boolean value which toggles noDataMessage on the grid.
   * Initial value is false.
   */
  private showNoDataMessageSubject = new BehaviorSubject<boolean>(false);

  /** Stream that emits boolean value which toggles the loader on the grid. */
  public loading$ = this.loadingSubject.asObservable();

  /** Stream that emits boolean value which toggles noDataMessage on the grid. */
  public showNoDataMessage$ = this.showNoDataMessageSubject.asObservable();

  /** Used by the MatTable. Called when it connects to the data source. */
  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  /** Used by the MatTable. Called when it disconnects from the data source. */
  disconnect(collectionViewer: CollectionViewer): void {
    this.dataSubject.complete();
    this.loadingSubject.complete();
    this.showNoDataMessageSubject.complete();
  }

  /**
   * Sets the given data array to the data stream.
   * @param data data to be set.
   */
  setDataSubject(data: T[]): void {
    this.dataSubject.next(data);
  }

  /**
   * Sets the loader stream to toggle loader on grid.
   * @param isLoading flag to be set.
   */
  setLoadingSubject(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  /**
   * Sets the show message stream to toggle the noDataMessage on the grid.
   * @param showMessage flag to be set.
   */
  setShowNoDataMessageSubject(showMessage: boolean): void {
    this.showNoDataMessageSubject.next(showMessage);
  }
}
