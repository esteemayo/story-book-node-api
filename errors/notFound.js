import { StatusCodes } from 'http-status-codes';
import AppError from './appError.js';

class NotFoundError extends AppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.NOT_FOUND;
    this.status = 'fail';
  }
}

export default NotFoundError;
