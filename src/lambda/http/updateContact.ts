import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getUserFromAuthHeader } from '../../auth/utils';
import { updateUserContact } from '../../businessLogic/contacts';
import { ContactItem } from '../../models/ContactItem';
import { UpdateContactRequest } from '../../requests/UpdateContactRequest';
import { ServerlessContactListAppError } from '../../errors';

const logger = createLogger('updateContact');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info({ message: 'Processing event', event });

  const userId: string = getUserFromAuthHeader(event.headers.Authorization);
  const contactId = event.pathParameters.contactId;
  const updateRequest: UpdateContactRequest = JSON.parse(event.body);

  try {
    const updatedContact: ContactItem = await updateUserContact(userId, contactId, updateRequest);

    return {
      statusCode: 200,
      body: JSON.stringify({ item: updatedContact }),
    };
  } catch (error) {
    logger.error(error);
    const errorResponse = { statusCode: 500, message: 'Internal server error' };
    if (error instanceof ServerlessContactListAppError) {
      errorResponse.statusCode = error.statusCode;
      errorResponse.message = error.message;
    }

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify(errorResponse),
    };
  }
});

handler.use(
  cors({
    credentials: true
  })
);
