import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getUserFromAuthHeader } from '../../auth/utils';
import { ContactItem } from '../../models/ContactItem';
import { getUserContacts } from '../../businessLogic/contacts';

const logger = createLogger('getContacts');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info({ message: 'Processing event', event });

  const userId: string = getUserFromAuthHeader(event.headers.Authorization);
  const contacts: ContactItem[] = await getUserContacts(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({ items: contacts }),
  };
});

handler.use(
  cors({
    credentials: true
  })
);

