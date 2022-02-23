const { StatusCodes } = require('http-status-codes');

class AppError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    this.status = 'error';
  }
}

module.exports = AppError;
