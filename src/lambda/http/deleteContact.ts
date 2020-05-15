import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getUserFromAuthHeader } from '../../auth/utils';
import { deleteUserContact } from '../../businessLogic/contacts';

const logger = createLogger('deleteContact');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info({ message: 'Processing event', event });

  const userId: string = getUserFromAuthHeader(event.headers.Authorization);
  const contactId = event.pathParameters.contactId;

  await deleteUserContact(userId, contactId);

  return {
    statusCode: 204,
    body: JSON.stringify({}),
  };
});

handler.use(
  cors({
    credentials: true
  })
);
