import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Emits FastAPI's `{ "detail": ... }` error body so clients need no changes. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({ detail: this.detail(exception) });
      return;
    }

    this.logger.error(
      `Unhandled error on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: 'Internal Server Error' });
  }

  private detail(exception: HttpException): unknown {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    const record = body as Record<string, unknown>;
    return record.detail ?? record.message ?? exception.message;
  }
}
