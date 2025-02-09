export class ResponseError extends Error {
  protected _status_code: number;

  constructor(code: number, message: string) {
    super(message);
    this._status_code = code;
  }

  public get status_code(): number {
    return this._status_code;
  }
}

export class BadRequestError extends ResponseError {
  constructor(message?: string) {
    super(400, message || 'bad request');
  }
}

export class InternalServerError extends ResponseError {
  constructor(message?: string) {
    super(500, message || 'internal server error');
  }
}

export class NotFoundError extends ResponseError {
  constructor(message?: string) {
    super(404, message || 'resources not found');
  }
}

export class ConflictError extends ResponseError {
  constructor(message?: string) {
    super(409, message || 'conflict');
  }
}

export const defaultNotFound = new NotFoundError();
export const defaultInternalServer = new InternalServerError();
export const defaultBadRequest = new BadRequestError();
export const defaultConflictError = new ConflictError();
