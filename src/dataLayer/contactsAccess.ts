import 'source-map-support/register';

import * as AWS  from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger';
import { ContactItem } from '../models/ContactItem';
import { NotFoundError } from '../errors';

const logger = createLogger('ContactsAccess');

export class ContactsAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly contactsTable: string = process.env.CONTACT_LIST_TABLE_NAME,
    private readonly contactIdLsiIndex: string = process.env.CONTACT_ID_INDEX_NAME) {
  }

  async putContact(contactItem: ContactItem): Promise<ContactItem> {
    logger.info('Putting contact item', contactItem);
    await this.docClient.put({
      TableName: this.contactsTable,
      Item: contactItem,
    }).promise();
    return contactItem;
  }

  async getContactsByUserId(userId: string): Promise<ContactItem[]> {
    logger.info(`Obtaining user contacts ${userId}`);

    const result = await this.docClient.query({
      TableName: this.contactsTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    }).promise();

    const items = result.Items;
    return items as ContactItem[];
  }

  async getUserContactById(userId: string, contactId: string): Promise<ContactItem> {
    logger.info('Retrieving contact by id', {userId, contactId});
    const result = await this.docClient.query({
      TableName: this.contactsTable,
      IndexName: this.contactIdLsiIndex,
      KeyConditionExpression: 'userId = :userId and contactId = :contactId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':contactId': contactId,
      },
    }).promise();

    if (result.Count === 0) {
      throw new NotFoundError(`Contact not found: ${contactId}`);
    }

    return result.Items[0] as ContactItem;
  }

  async deleteContact(contact: ContactItem): Promise<any> {
    logger.info('Deleting user contact', contact);
    const params = {
      TableName: this.contactsTable,
      Key: {
        userId: contact.userId,
        name: contact.name,
      },
    };

    await this.docClient.delete(params).promise();
  }
}
