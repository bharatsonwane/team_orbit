import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from './openAPIDocumentGenerator';

export const openAPIRouter = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get(
  '/swagger.json',
  (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openAPIDocument);
  }
);

openAPIRouter.use('/', swaggerUi.serve, swaggerUi.setup(openAPIDocument));

export default openAPIRouter;
