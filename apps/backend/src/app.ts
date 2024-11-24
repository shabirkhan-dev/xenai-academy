import { errorHandler, notFound } from '@/errors';
import { createHttpLogger, createLogger } from '@/utils/loger';
import cors from 'cors';
import express from 'express';


const logger = createLogger('Server');
const httpLogger = createHttpLogger(logger);
export const app = express()



// ┌──────────────────────────────────────────┐
//│            Middlewares                   │
//└─────────────────────────────────────────┘
app.use(httpLogger);
app.use(cors());

// ℹ️ Routes will be added here
app.get('/health', (_req, res) => { res.send('OK') });


// Error handling
app.use(notFound);
app.use(errorHandler);

