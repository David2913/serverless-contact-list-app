import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getUserFromAuthHeader } from '../../auth/utils';

const logger = createLogger('createContact');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info({ message: 'Processing event', event });
  const userId: string = getUserFromAuthHeader(event.headers.Authorization);

  return {
    statusCode: 201,
    body: JSON.stringify({ message: `Creating contact for: ${userId}` }),
  };
});

handler.use(
  cors({
    credentials: true
  })
);
