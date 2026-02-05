import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch() // <- pega qlqr erro
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    //erro do nest
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      return response.status(status).json({
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
        error: 'HttpError',
        message: 'Request failed',
      });
    }

    //erro do prisma
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, message } = this.handlePrismaError(exception);

      return response.status(status).json({
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
        error: 'PrismaError',
        message,
      });
    }

    // erro desconhecido
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: 'InternalServerError',
      message: 'Unexpected error',
    });
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002':
        return { status: 409, message: 'Resource already exists' };
      case 'P2025':
        return { status: 404, message: 'Resource not found' };
      default:
        return { status: 400, message: 'Database error' };
    }
  }
}
