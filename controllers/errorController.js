const { StatusCodes } = require('http-status-codes');

const handleCastErrorDB = (customError, err) => {
  customError.message = `Invalid ${err.path}: ${err.value}`;
  customError.statusCode = StatusCodes.BAD_REQUEST;
};

const handleDuplicateFieldsDB = (customError, err) => {
  const value = err.message.match(/(["'])(\\?.)/)[0];
  customError.message = `Duplicate field value: ${value}. Please use another value.`;
  customError.statusCode = StatusCodes.BAD_REQUEST;
};

const handleValidationErrorDB = (customError, err) => {
  const errors = Object.values(err.errors).map((item) => item.message);
  customError.message = `Invalid input data. ${errors.join('. ')}`;
  customError.statusCode = StatusCodes.BAD_REQUEST;
};

const handleJWTError = (customError) => {
  customError.message = 'Invalid token. Please log in again!';
  customError.statusCode = StatusCodes.UNAUTHORIZED;
};

const handleJWTExpiredError = (customError) => {
  customError.message = 'Your token has expired! Please log in again!';
  customError.statusCode = StatusCodes.UNAUTHORIZED;
};

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.statck,
  });
};

const sendErrorProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, please try again later',
    status: err.status,
    stack: err.stack,
  };

  if (err.name === 'CastError') handleCastErrorDB(customError, err);
  if (err.code && err.code === 11000) handleDuplicateFieldsDB(customError, err);
  if (err.name === 'ValidationError') handleValidationErrorDB(customError, err);
  if (err.name === 'JsonWebTokenError') handleJWTError(customError);
  if (err.name === 'TokenExpiredError') handleJWTExpiredError(customError);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(customError, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(customError, res);
  }
};
