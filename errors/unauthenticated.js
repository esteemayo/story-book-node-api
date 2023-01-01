import { StatusCodes } from 'http-status-codes';
import AppError from './appError.js';

class UnauthenticatedError extends AppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.status = 'fail';
  }
}

export default UnauthenticatedError;
