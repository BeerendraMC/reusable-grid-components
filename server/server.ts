import * as express from 'express';
import { Application } from 'express';
import { getEmployees } from './employees.route';

const app: Application = express();

app.route('/api/employees').get(getEmployees);

const httpServer: any = app.listen(3200, () => {
  console.log('HTTP REST API Server running at http://localhost:' + httpServer.address().port);
});
