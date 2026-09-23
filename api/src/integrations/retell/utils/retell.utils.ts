import { HttpException, InternalServerErrorException } from '@nestjs/common';
import Retell from 'retell-sdk';

/**
 * Converts Retell SDK errors into NestJS exceptions so the default exception
 * filter returns the upstream status code (400, 401, 404, 429, ...) instead of a 500.
 */
export function toHttpException(error: unknown): Error {
  if (error instanceof HttpException) return error;

  if (error instanceof Retell.APIError && error.status) {
    return new HttpException(error.message, error.status);
  }

  return new InternalServerErrorException(
    error instanceof Error ? error.message : 'Unexpected Retell error',
  );
}
