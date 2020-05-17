import 'source-map-support/register';

import * as uuid from 'uuid';
import { ContactItem} from '../models/ContactItem';
import { CreateContactRequest } from '../requests/CreateContactRequest';
import { UpdateContactRequest } from '../requests/UpdateContactRequest';
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

export async function deleteUserContact(
  userId: string,
  contactId: string,
): Promise<any> {
  const contactItem: ContactItem = await contactsAccess.getUserContactById(userId, contactId);
  await contactsAccess.deleteContact(contactItem);
}

export async function updateUserContact(
  userId: string,
  contactId: string,
  updateRequest: UpdateContactRequest,
): Promise<ContactItem>  {
  const contactItem: ContactItem = await contactsAccess.getUserContactById(userId, contactId);

  contactItem.phone = updateRequest.phone;
  contactItem.photoUrl = updateRequest.photoUrl;

  const updatedContactItem: ContactItem = await contactsAccess.putContact(contactItem);
  return updatedContactItem;
}
