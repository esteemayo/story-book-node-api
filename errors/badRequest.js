const { StatusCodes } = require('http-status-codes');
const AppError = require('./appError');

class BadRequestError extends AppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.BAD_REQUEST;
    this.status = 'fail';
  }
}

module.exports = BadRequestError;
