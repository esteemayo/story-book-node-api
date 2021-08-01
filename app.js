const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const path = require('path');
const hpp = require('hpp');

// requiring routes
const globalErrorHandler = require('./controllers/errorController');
const commentRoute = require('./routes/comments');
const storyRoute = require('./routes/stories');
const AppError = require('./utils/appError');
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
app.use(hpp({
    whitelist: ['title', 'body']
}));

// compression middleware
app.use(compression());

// test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    // console.log(req.cookies);

    next();
});

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
    return cb(new AppError('Not an image! Please upload only images', 400), false);
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

// routes
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/stories', storyRoute);
app.use('/api/v1/users', userRoute);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
