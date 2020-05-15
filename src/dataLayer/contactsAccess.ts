import 'source-map-support/register';

import * as AWS  from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger';
import { ContactItem } from '../models/ContactItem';

const logger = createLogger('ContactsAccess');

export class ContactsAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly contactsTable: string = process.env.CONTACT_LIST_TABLE_NAME) {
  }

  async putContact(contactItem: ContactItem): Promise<ContactItem> {
    logger.info('Putting contact item', contactItem);
    await this.docClient.put({
      TableName: this.contactsTable,
      Item: contactItem,
    }).promise();
    return contactItem;
  }
}
