const { StatusCodes } = require('http-status-codes');
const AppError = require('./appError');

class UnauthenticatedError extends AppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.status = 'fail';
  }
}

module.exports = UnauthenticatedError;
