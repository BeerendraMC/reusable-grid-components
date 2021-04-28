window.addEventListener('DOMContentLoaded', loadGrid);

const ColumnType = Object.freeze({
  Text: 0,
  Date: 1,
  Link: 2,
  Dropdown: 3,
  LinkAndDescription: 4
});

const DISPLAYED_COLUMNS = ['id', 'name', 'gender', 'company', 'phone', 'email'];

const GRID_CONFIG = [
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
    name: 'company',
    label: 'Company',
    columnType: ColumnType.Text,
    sort: true,
    style: { width: '20%' }
  },
  {
    name: 'phone',
    label: 'Phone',
    columnType: ColumnType.Text,
    sort: true,
    style: { width: '25%' }
  },
  {
    name: 'email',
    label: 'Email',
    columnType: ColumnType.Text,
    align: 'center',
    style: { width: '15%' }
  }
];

function loadGrid() {
  let gridEl = document.querySelector('bmc-custom-data-grid');
  gridEl.gridConfig = GRID_CONFIG;
  gridEl.displayedColumns = DISPLAYED_COLUMNS;
  gridEl.defaultSortColumn = { name: 'name', sortDirection: 'asc' };
  // gridEl.verticalScrollOffsetInRows = 5;
  gridEl.searchOption = {
    onColumn: 'globalFilter',
    searchTextBoxLabel: 'Global search',
    searchBoxStyle: {
      margin: 0,
      width: '100%',
      padding: '10px',
      'box-sizing': 'border-box'
    }
  };
  gridEl.freezeFirstAndLastColumns = true;

  fetch('https://jsonplaceholder.typicode.com/users')
    .then(response => response.json())
    .then(users => {
      const data = users.map((user, i) => ({
        id: user.id,
        name: {
          Link: user.name,
          Description: user.username,
          SearchSortField: 'Link'
        },
        company: user.company.name,
        gender: i === 4 ? 'female' : 'male',
        phone: user.phone,
        email: user.email
      }));
      // data.push({
      //   id: null,
      //   name: {
      //     Link: null,
      //     Description: null,
      //     SearchSortField: "Link",
      //   },
      //   company: null,
      //   gender: null,
      //   phone: null,
      //   email: null,
      // });
      gridEl.dataSource = data;
    });

  gridEl.addEventListener('linkClick', event => {
    console.log(event.detail);
  });

  gridEl.addEventListener('selectionChange', event => {
    console.log(event.detail);
  });
}
