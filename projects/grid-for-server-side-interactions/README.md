# CustomMaterialGrid for Server Side Interactions

CustomDataGrid is a configurable and re-usable component built on angular using [Angular Material data table](https://material.angular.io/components/table/overview) which supports server side interactions (pagination, sorting, filtering).

## How to run

> `npm run start:grid-for-server-side-interactions`

Navigate to `http://localhost:4300/`. The app will automatically reload if you change any of the source files.

## Documentation

This component dynamically renders the grid using `GridConfig` as Input array of objects where each object represents the configuration of a given column. And four events are exposed as output objects, respective actions can be taken on parent component.

This has capability to integrate with any API response format and each actions can be controlled from parent component.

This component also supports `custom CSS` (column level), `hyperlink`, `hyperlink and description`, `dropdown` and `custom templates`.

### `Output` events:

- `linkClick`: event emitted on click of hyperlink with the respective row data object.
- `selectionChange`: event emitted on selection change of dropdown with the respective row data object and the selected value.
- `sortOrPageChange`: event emitted on sort (active sort or sort direction) change and/or page (size or index) change with the respective event data (`Sort` or `PageEvent`).
- `searchInputChange`: event emitted with the search term when the user enters search term in the search input.

Here are the GridConfig, DropdownValue interfaces and ColumnType enum:

```typescript
export enum ColumnType {
  Text,
  Date,
  Link,
  Dropdown,
  LinkAndDescription,
  CustomTemplate
}

export interface GridConfig {
  name: string;
  label: string;
  columnType: ColumnType;
  style?: {};
  sort?: boolean;
  dropdownValues?: DropdownValue[];
  align?: 'right' | 'center';
  customTemplate?: TemplateRef<any>;
}

export interface DropdownValue {
  value: string | number;
  viewValue: string | number;
}
```

### `GridConfig` properties:

- `name`: represents the name of the property to bind to. This should match the property name of your model
- `label`: represents the column header label to display on the grid
- `columnType`: it’s of type ColumnType enum. It represents what kind of values that the column is going to have. The Date column will display date objects in ‘MMM dd, yyyy’ format
- `style`: style object. Styles provided here will apply to the respective column
- `sort`: represents whether the sort option is required on the column or not (defaults to false)
- `dropdownValues`: an array of objects representing the dropdown options
- `align`: represents the column alignment (defaults to left)
- `customTemplate`: represents the reference to the custom template

### Sample Configuration array

```typescript
gridConfiguration: GridConfig[] = [
  { name: 'id', label: 'Id', columnType: ColumnType.Text, sort: true, style: { width: '5%' } },
  { name: 'name', label: 'Name', columnType: ColumnType.LinkAndDescription, sort: true, style: { width: '20%' } },
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
]
```

### List of Features supported

- Server side pagination, sorting and filtering.
- Configurable page size options.
- Vertical scroll bar if the user selects more than the given no of rows per page (that number is configurable). When the user selects 20 rows per page from the page size options the height of the grid increases but our customer wanted to freeze the height to display a certain no of rows (10 or 5) and introduce a vertical scroll if the user wants to view more rows than that number.
- Hyperlink
- Hyperlink and description
- Dropdown
- Multiple Custom Template columns.
- Custom CSS (column level).
- Spinner (while fetching data from the api).
- Configurable message to display when there is no data (defaults to ‘No data available.’)
- Freezing first and last columns for mobile devices (screens < 1024px width) and introduce horizontal scroll bar.
