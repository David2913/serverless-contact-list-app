export class ServerlessContactListAppError extends Error {
  statusCode: number;

  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ServerlessContactListAppError';
    this.statusCode = statusCode;
  }
}

export class AuthorizationError extends ServerlessContactListAppError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ServerlessContactListAppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
