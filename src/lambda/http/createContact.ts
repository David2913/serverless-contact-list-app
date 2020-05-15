import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getUserFromAuthHeader } from '../../auth/utils';
import { CreateContactRequest } from '../../requests/CreateContactRequest';
import { ContactItem } from '../../models/ContactItem';
import { createOrReplaceContact } from '../../businessLogic/contacts';

const logger = createLogger('createContact');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info({ message: 'Processing event', event });

  const userId: string = getUserFromAuthHeader(event.headers.Authorization);
  const createContactRequest: CreateContactRequest = JSON.parse(event.body);

  const newItem: ContactItem = await createOrReplaceContact(userId, createContactRequest);

  return {
    statusCode: 201,
    body: JSON.stringify({ item: newItem }),
  };
});

handler.use(
  cors({
    credentials: true
  })
);
