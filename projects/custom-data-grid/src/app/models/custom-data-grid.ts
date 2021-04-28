import { TemplateRef } from '@angular/core';

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
