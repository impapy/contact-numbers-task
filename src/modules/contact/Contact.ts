import { ClientSession, FilterQuery, ObjectId } from 'mongodb'
import { db } from '../../db'
import { DBCollections, ResourcesSortOptions } from '../../types'
import { parsePhoneNumber, sanitizeUsername } from '../../helpers'
import Error from '../../interfaces/error.interfaces'
import secrets from '../../secrets'
import {
  Contact,
  ContactAddInput,
  ContactEditInput,
  ContactFilterInput,
  ContactGetResponse,
  ContactsGetInput,
  ContactsSort,
  Keysof,
} from './types'
import { PER_PAGE } from '../../constants'
import { mergeDeepRight, omit } from 'ramda'

export class ContactService {
  protected sort(sort: ContactsSort = ContactsSort.NEWEST): ResourcesSortOptions[ContactsSort] {
    const options: ResourcesSortOptions = {
      NEWEST: { createdAt: -1 },
      OLDEST: { createdAt: 1 },
    }

    return options[sort] || sort
  }

  protected filter(filter: ContactFilterInput): FilterQuery<Contact> {
    const symbolsRegex = /[.*+?^${}()|[\]\\]/g
    const searchObject = filter.searchTerm && {
      $regex: filter.searchTerm.replace(symbolsRegex, '\\$&'),
      $options: 'i',
    }
    return {
      ...(filter.searchTerm && {
        $or: [
          { phone: searchObject },
          { name: searchObject },
          {
            phone: {
              $regex: parsePhoneNumber(filter.searchTerm).replace(symbolsRegex, '\\$&'),
              $options: 'i',
            },
          },
        ],
      }),

      isDeleted: false,
    }
  }
  /////////////////////////////

  async creat(userAddInput: Omit<ContactAddInput, 'createdAt' | 'modifiedAt' | 'isDeleted' | 'islocked'>, session?: ClientSession): Promise<Contact> {
    try {
      const phoneNumber = parsePhoneNumber(userAddInput.phone)
      const possibleUser = await db.collection<Contact>(DBCollections.CONTACTS).findOne({
        phone: phoneNumber,
        isDeleted: false,
      })
      if (possibleUser) throw new Error('CONTACT EXISTS')
      const now = new Date()
      const result = await db.collection<Contact>(DBCollections.CONTACTS).insertOne(
        { ...userAddInput, phone: phoneNumber, islocked: false, createdAt: now, modifiedAt: now, isDeleted: false },
        {
          session,
        },
      )
      return result.ops[0] as Contact
    } catch (error) {
      throw new Error(`unable to create : ${(error as Error).message}`)
    }
  }

  async contact(filter: { _id: string }): Promise<Contact | null> {
    try {
      const contact = await db.collection<Contact>(DBCollections.CONTACTS).findOne({
        _id: new ObjectId(filter._id),
        isDeleted: false,
      })
      return contact
    } catch (error) {
      throw new Error('not found contact')
    }
  }

  async contacts(input: ContactsGetInput): Promise<ContactGetResponse> {
    try {
      const sortOptions = this.sort(input.sort || ContactsSort.NEWEST)
      const filterOptions = this.filter(input?.filter || {})
      const skip = (input.page ? input.page - 1 : 1 - 1) * (input.perPage || PER_PAGE)
      const [nodes, total] = await Promise.all([
        await db
          .collection<Contact>(DBCollections.CONTACTS)
          .find(filterOptions)
          .sort(sortOptions)
          .skip(skip)
          .limit(input.perPage || PER_PAGE)
          .toArray(),
        await db.collection<Contact>(DBCollections.CONTACTS).find(filterOptions).count(),
      ])
      const hasNextPage = (input.page || 1) * (input.perPage || PER_PAGE) < total
      return { nodes, pageInfo: { total, hasNextPage, perPage: input.perPage || PER_PAGE, currentPage: input.page || 1 } }
    } catch (error) {
      throw new Error('not found contacts')
    }
  }

  async contactEdit(filter: { _id: string }, update: ContactEditInput, session?: ClientSession): Promise<Contact> {
    const resource = await this.contact({ _id: filter._id })
    if (!resource) {
      throw new Error('NOT FOUND')
    }

    const mergedResource = mergeDeepRight(resource, update) as Contact

    await db.collection<Contact>(DBCollections.CONTACTS).updateOne(
      {
        _id: new ObjectId(filter._id),
        isDeleted: false,
      },
      {
        $set: { ...mergedResource, ...(mergedResource.phone && { phone: parsePhoneNumber(mergedResource.phone) }), modifiedAt: new Date() },
      },
      { session },
    )

    return mergedResource
  }

  async contactDelete(filter: { _id: string }, session?: ClientSession): Promise<ObjectId> {
    return await this.contactEdit(filter, { isDeleted: true } as any, session)
  }
}
