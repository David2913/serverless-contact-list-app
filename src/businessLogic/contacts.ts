import 'source-map-support/register';

import * as uuid from 'uuid';
import { ContactItem} from '../models/ContactItem';
import { CreateContactRequest } from '../requests/CreateContactRequest';
import { ContactsAccess } from '../dataLayer/contactsAccess';

const contactsAccess = new ContactsAccess();

export async function createOrReplaceContact(
  userId: string,
  createContactRequest: CreateContactRequest
): Promise<ContactItem> {
  const contactItem: ContactItem = await contactsAccess.putContact({
    userId,
    contactId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: createContactRequest.name,
    phone: createContactRequest.phone,
    photoUrl: createContactRequest.photoUrl,
  });

  return contactItem;
}

export async function getUserContacts(userId: string): Promise<ContactItem[]> {
  return contactsAccess.getContactsByUserId(userId);
}
