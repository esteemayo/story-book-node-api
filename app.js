const mongoSanitize = require('express-mongo-sanitize');
const { StatusCodes } = require('http-status-codes');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const helmet = require('helmet');
const xss = require('xss-clean');
const YAML = require('yamljs');
const cors = require('cors');
const path = require('path');
const hpp = require('hpp');

const swaggerDocument = YAML.load('./swagger.yaml');

// requiring routes
const globalErrorHandler = require('./controllers/errorController');
const BadRequestError = require('./errors/badRequest');
const NotFoundError = require('./errors/notFound');
const commentRoute = require('./routes/comments');
const storyRoute = require('./routes/stories');
const userRoute = require('./routes/users');

// start express app
const app = express();

// global middleware
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
    message: 'Too many requests from this IP, Please try again in an hour'
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

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
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    }
    return cb(new BadRequestError('Not an image! Please upload only images'), false);
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

app.post('/api/v1/uploads', upload.single('file'), (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'File has been uploaded!'
    });
});

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res, next) => {
    res.status(StatusCodes.OK).send('<h1>Story-Books API</h1><a href="/api-docs">Documentation</a>');
});

// api routes
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/stories', storyRoute);
app.use('/api/v1/users', userRoute);

app.all('*', (req, res, next) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
