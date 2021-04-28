import { Request, Response } from 'express';
import { EMPLOYEES } from './db-data';

export const getEmployees = (req: Request, res: Response) => {
  const { filter, sortColumn, sortOrder, pageNumber, pageSize } = req.query;

  let employees = Object.values(EMPLOYEES);
  let dataCount = employees?.length || 0;

  if (filter) {
    // Filters by name
    employees = employees.filter(
      emp =>
        emp.name
          .trim()
          .toLowerCase()
          .search((filter as string).trim().toLowerCase()) >= 0
    );

    dataCount = employees?.length || 0;
  }

  const direction: number = sortOrder === 'asc' ? 1 : 0;
  switch (sortColumn) {
    case 'id':
      employees = sortArray(employees, 'id', direction);
      break;
    case 'name':
      employees = sortArray(employees, 'name', direction);
      break;
    case 'gender':
      employees = sortArray(employees, 'gender', direction);
      break;
    case 'email':
      employees = sortArray(employees, 'email', direction);
      break;
    case 'phone':
      employees = sortArray(employees, 'phone', direction);
      break;
  }

  const initialPos: number = Number(pageNumber) * Number(pageSize);

  const employeesPage = employees.slice(initialPos, initialPos + Number(pageSize));

  setTimeout(() => {
    res.status(200).json({ data: employeesPage, dataCount });
    // res.status(500).send();
  }, 1000);
};

const sortArray = (array: any[], property: string, direction: number = 1): any[] => {
  if (array) {
    array.sort((a, b) => {
      let av = a[property];
      let bv = b[property];
      if (typeof a[property] === 'string') {
        av = (a[property] as string).toLowerCase();
        bv = (b[property] as string).toLowerCase();
      }
      if (av > bv) {
        return direction === 1 ? 1 : -1;
      } else if (av < bv) {
        return direction === 1 ? -1 : 1;
      }
      return 0;
    });
  }
  return array;
};
