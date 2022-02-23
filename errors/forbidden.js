const { StatusCodes } = require('http-status-codes');
const AppError = require('./appError');

class ForbiddenError extends AppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.FORBIDDEN;
    this.status = 'fail';
  }
}

module.exports = ForbiddenError;
