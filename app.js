import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import YAML from 'yamljs';
import { StatusCodes } from 'http-status-codes';

const swaggerDocument = YAML.load('./swagger.yaml');

// requiring routes
import BadRequestError from './errors/badRequest.js';
import commentRoute from './routes/comments.js';
import userRoute from './routes/users.js';
import bookmarkRoute from './routes/bookmarks.js';
import NotFoundError from './errors/notFound.js';
import storyRoute from './routes/stories.js';
import historyRoute from './routes/history.js';
import globalErrorHandler from './controllers/errorController.js';

// start express app
const app = express();

// global middleware
app.set('trust proxy', 1);

// implement CORS
app.use(cors());

// access-control-allow-origin
app.options('*', cors());

// serving static files
app.use('/images', express.static(path.join(`${__dirname}/images`)));

// set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour',
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(hpp());

// compression middleware
app.use(compression());

// test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);

  next();
});

// file upload
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }
  return cb(
    new BadRequestError('Not an image! Please upload only images'),
    false
  );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

app.post('/api/v1/uploads', upload.single('file'), (req, res, next) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'File has been uploaded!',
  });
});

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res, next) => {
  res
    .status(StatusCodes.OK)
    .send('<h1>Story-Books API</h1><a href="/api-docs">Documentation</a>');
});

// api routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/stories', storyRoute);
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/histories', historyRoute);
app.use('/api/v1/bookmarks', bookmarkRoute);

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

export default app;
