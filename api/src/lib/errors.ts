import { FastifyError, FastifyReply } from 'fastify';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const Unauthorized = (msg = 'Unauthorized') => new HttpError(401, msg);
export const Forbidden = (msg = 'Forbidden') => new HttpError(403, msg);
export const NotFound = (msg = 'Not found') => new HttpError(404, msg);
export const BadRequest = (msg: string) => new HttpError(400, msg);
export const InternalError = (msg = 'Internal server error') => new HttpError(500, msg);

export function handleError(err: FastifyError | HttpError | Error, reply: FastifyReply) {
  if (err instanceof HttpError) {
    return reply.status(err.statusCode).send({ error: err.message });
  }
  reply.log.error(err);
  return reply.status(500).send({ error: 'Internal server error' });
}
